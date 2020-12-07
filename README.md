# Mapex

### Introduction and Project Objective

Mapex is a web application where you can record and review your experience in places around the world.

You can also download the raw data and get a report of all your reviews.

### Languages 

- ***JavaScript*** 
  - DOM Manipulation.
  - Interact with HTML and CSS to present users a easy-to-use and lovely UI.
  - Implements the main logic of the project.
  - Work along with **leaflet** API to offer map visulization.
- ***Python***
  - Interact with JavaScript, provide a light-weight backend server via Flask Restful API.
  - Use **pandas** and **numpy** library to provide data analysis and visual presentation.
  - library usage: `flask`, `pandas`, `numpy`
- ***GO***
  - Interact with python backend server.
  - Be responsible for all calculations in the project.

### Inter-Language Communication

- JavaScript and Python
  - Flask Restful API
- Python and GO
  - RabbitMQ

### Usage

##### Starting the VM

This repository is designed to deploy itself into a virtual machine, managed by [Vagrant](https://www.vagrantup.com/downloads.html) and [VirtualBox](https://www.virtualbox.org/wiki/Downloads).

```
vagrant up
vagrant ssh	// two terminals needed
```

##### Enter project directory

```
$ cd project/Mapex/
```

##### Launch GO calculator

```
/project/Mapex$ Go run calculator.go
```

##### Launch Python Server

```
/project/Mapex$ source env/bin/activate
(env)/project/Mapex$ python3 application.py
```

##### Launch the website from browser

```
127.0.0.1: 5000	// port number depends on flask server, please have a look on that
```

*You may zoom the browser to have better presentation.*

### Features

1. Review recording
2. Data Analysis
3. Raw data processing and downloading





