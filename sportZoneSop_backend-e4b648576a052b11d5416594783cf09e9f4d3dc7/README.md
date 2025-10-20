# SportZoneVN Backend - Auth (Register & Login) for SQL Server

## What's inside
This project contains a minimal Node.js + Express backend implementing two APIs:
- `POST /api/auth/register` — register a new account (writes to TaiKhoan table)
- `POST /api/auth/login` — login and receive a JWT token

The project uses **SQL Server (mssql)**. Update DB credentials in `.env`.

## Quick start (VS Code)
1. Install Node.js (LTS) and SQL Server / SQL Server Express.
2. Open this folder in VS Code.
3. Run in terminal:
   ```bash
   npm install
   ```
4. Ensure your database `sportzonevn` and tables (TaiKhoan) exist. Example snippet (T-SQL) to create TaiKhoan:
   ```sql
   CREATE DATABASE sportzonevn;
   GO
   USE sportzonevn;
   GO
   CREATE TABLE VaiTro (
     MaVaiTro INT IDENTITY(1,1) PRIMARY KEY,
     TenVaiTro NVARCHAR(150)
   );
   CREATE TABLE TaiKhoan (
     MaTK INT IDENTITY(1,1) PRIMARY KEY,
     TenDangNhap NVARCHAR(100) UNIQUE,
     MatKhau NVARCHAR(255),
     Email NVARCHAR(150),
     TrangThaiHoatDong BIT DEFAULT 1,
     NgayTao DATETIME DEFAULT GETDATE(),
     NgayCapNhat DATETIME DEFAULT GETDATE(),
     MaVaiTro INT FOREIGN KEY REFERENCES VaiTro(MaVaiTro)
   );
   ```
5. Create a `.env` file (copy from `.env.example`) and edit DB settings.
6. Start the server:
   ```bash
   npm start
   ```
7. Test endpoints with Postman or Thunder Client:
   - `POST http://localhost:3000/api/auth/register`
   - `POST http://localhost:3000/api/auth/login`
