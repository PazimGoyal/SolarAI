# SolarAI
 

A full-stack application to calculate optimal solar panel **tilt** and **azimuth** based on geographic coordinates and optional offset angle, with optional solar insolation estimates and map visualization.



## Features

### Frontend (TypeScript + Leaflet)
- Input latitude, longitude, and optional offset angle
- Clickable Leaflet map to select coordinates
- Visual display of selected location and computed angles
- Dynamic display of solar insolation (if available)
- Clean UI served with Nginx in Docker

### Backend (Django + pvlib)
- Compute optimal solar **tilt** and **azimuth** based on location
- Use of `pvlib` and NREL/solar geometry formulas
- Optional support for real-world insolation data (e.g., SolarAnywhere)
- Clean API returning JSON responses
- Dockerized with production-ready settings

### Infra
- Dockerized frontend and backend
- `docker-compose` support for easy orchestration
- Kubernetes-ready (K8s manifests and Helm optional)

---

## Technologies Used

| Layer       | Tech Stack                          |
|-------------|-------------------------------------|
| Frontend    | TypeScript, HTML/CSS, Leaflet, Nginx |
| Backend     | Python, Django, pvlib               |
| Build Tools | Docker, Docker Compose              |

---

##  Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js and Python (for local dev)

### 1. Clone the Repo

```bash
git clone https://github.com/PazimGoyal/SolarAI.git
cd SolarAI

create .env file add secrets

SECRET_KEY = '*'
SOLAR_ANYWHERE_KEY = '*'


docker compose up --build

run localhost:3000

```


![Screenshot 2025-06-22 at 1 26 51 PM](https://github.com/user-attachments/assets/d8a52f80-ee23-454b-81fe-8afc6cb51608)


