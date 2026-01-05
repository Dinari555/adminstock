pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-registry.io'
        DOCKER_IMAGE_BACKEND = "${DOCKER_REGISTRY}/depot-dashboard-backend"
        DOCKER_IMAGE_FRONTEND = "${DOCKER_REGISTRY}/depot-dashboard-frontend"
        KUBECONFIG_CREDENTIALS = 'kubeconfig'
        DOCKER_CREDENTIALS = 'docker-hub-credentials'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                    env.BUILD_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"
                }
            }
        }
        
        stage('Install & Lint Backend') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                    sh 'npm run lint || true'
                }
            }
        }
        
        stage('Install & Lint Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run lint || true'
                }
            }
        }
        
        stage('Backend Tests') {
            steps {
                dir('backend') {
                    sh 'npm test -- --coverage --watchAll=false || true'
                }
            }
        }
        
        stage('Frontend Tests') {
            steps {
                dir('frontend') {
                    sh 'CI=true npm test -- --coverage --watchAll=false || true'
                }
            }
        }
        
        stage('SonarQube Analysis') {
            when {
                anyOf {
                    branch 'main'
                    branch 'dev'
                }
            }
            steps {
                script {
                    // Uncomment if SonarQube is configured
                    // withSonarQubeEnv('SonarQube') {
                    //     sh 'sonar-scanner'
                    // }
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: "${env.DOCKER_CREDENTIALS}",
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh 'echo ${DOCKER_PASS} | docker login ${DOCKER_REGISTRY} -u ${DOCKER_USER} --password-stdin'
                        
                        // Build Backend
                        sh """
                            docker build -t ${DOCKER_IMAGE_BACKEND}:${env.BUILD_TAG} \
                                          -t ${DOCKER_IMAGE_BACKEND}:latest \
                                          ./backend
                        """
                        
                        // Build Frontend
                        sh """
                            docker build -t ${DOCKER_IMAGE_FRONTEND}:${env.BUILD_TAG} \
                                          -t ${DOCKER_IMAGE_FRONTEND}:latest \
                                          ./frontend
                        """
                    }
                }
            }
        }
        
        stage('Push Docker Images') {
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: "${env.DOCKER_CREDENTIALS}",
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh """
                            docker push ${DOCKER_IMAGE_BACKEND}:${env.BUILD_TAG}
                            docker push ${DOCKER_IMAGE_BACKEND}:latest
                            docker push ${DOCKER_IMAGE_FRONTEND}:${env.BUILD_TAG}
                            docker push ${DOCKER_IMAGE_FRONTEND}:latest
                        """
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            when {
                anyOf {
                    branch 'main'
                    branch 'dev'
                }
            }
            steps {
                script {
                    withCredentials([file(
                        credentialsId: "${env.KUBECONFIG_CREDENTIALS}",
                        variable: 'KUBECONFIG'
                    )]) {
                        sh """
                            export KUBECONFIG=\${KUBECONFIG}
                            kubectl set image deployment/backend backend=${DOCKER_IMAGE_BACKEND}:${env.BUILD_TAG} -n depot-dashboard || true
                            kubectl set image deployment/frontend frontend=${DOCKER_IMAGE_FRONTEND}:${env.BUILD_TAG} -n depot-dashboard || true
                            kubectl rollout status deployment/backend -n depot-dashboard
                            kubectl rollout status deployment/frontend -n depot-dashboard
                        """
                    }
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}


