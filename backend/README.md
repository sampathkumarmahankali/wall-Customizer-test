# Wallora Auth Server

## Setup

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Create MySQL Database and Table:**
   - Create a database (default: `wallora`)
   - Create a `users` table:
     ```sql
     CREATE TABLE users (
       id INT AUTO_INCREMENT PRIMARY KEY,
       email VARCHAR(255) NOT NULL UNIQUE,
       password VARCHAR(255) NOT NULL
     );
     ```

3. **Configure DB Connection (optional):**
   - Set environment variables if needed:
     - `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`

4. **Run the server:**
   ```sh
   npm start
   ```
   The server will run on [http://localhost:4000](http://localhost:4000)

## API Endpoints

- `POST /api/register` — `{ email, password }`
- `POST /api/login` — `{ email, password }` 