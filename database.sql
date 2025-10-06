CREATE DATABASE jcnet;

USE jcnet;

-- Tabela de regiões
CREATE TABLE regions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de cidades
CREATE TABLE cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE
);

-- Tabela de notícias
CREATE TABLE news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    city_id INT,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, password)
VALUES ('Administrador', 'admin@dominio.com', '$2b$10$7H0ZyI5K1tZt/8c6vGnM.uCq7V0A8K1P2K5x6L4cQyB/9Z9P6Fv2e');

CREATE TABLE news_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  news_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE
);


CREATE TABLE ads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  link VARCHAR(255) NOT NULL,
  priority INT DEFAULT 0,
  active TINYINT DEFAULT 1,
  user_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

