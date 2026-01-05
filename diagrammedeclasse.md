flowchart TD
    A[Début] --> B{Utilisateur connecté ?}
    B -->|Oui| C[Accès au tableau de bord]
    B -->|Non| D[Redirection vers login]
