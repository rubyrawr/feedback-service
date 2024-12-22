# fb-service
# Деплой
Для запуска проекта в локальной среде нужно:
1) установить node.js версии 20 (LTS) и npm
2) установить postgresql версии 16.3
3) в консоли postgres:
```
create database feedback;
```
```
\c feedback
```
```
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(128) NOT NULL,
  password VARCHAR(512) NOT NULL,
  avatar TEXT
);
CREATE TABLE feedbacks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(64) NOT NULL,
  content TEXT NOT NULL,
  category INTEGER NOT NULL,
  status INTEGER DEFAULT 0,
  author_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  user_id SERIAL REFERENCES users (id),
  feedback_id SERIAL REFERENCES feedbacks(id)
);
```
4) 
```
git clone https://github.com/rubyrawr/fb-service.git
cd fb-service/
npm install
```
5) создать .env файл, в нём указать:
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=<пароль пользователя постгрес>
DB_NAME=feedback
JWT_SECRET=<любое секретное слово>
```

6)
```
npm run dev
```
Сервер запустится по адресу http://localhost:5000/

Документация http://localhost:5000/docs/
