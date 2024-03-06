const express = require("express");
const app = express();
const cors = require("cors");
const mysql = require("mysql");

// Conexion de db a servidor 3001
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "vacantes_react",
});

app.use(cors());
app.use(express.json());
app.listen(3001, () => {
  console.log("Listening on 3001");
});

app.get("/", (req, res) => {
  res.send({
    status: 200,
  });
});

// Registrar empresa
app.post("/company", (req, res) => {
  const company = req.body.company;
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const logo = req.body.logo;
  db.query(
    `INSERT INTO company (company, username, email, password, logo) VALUES (?,?,?,md5(?), IFNULL(?, ''))`,
    [company, username, email, password, logo],
    (err, result) => {
      if (err) {
        res.send({
          status: 400,
          message: err,
        });
      } else {
        res.status(201).send({
          status: 201,
          message: "Empresa creada con éxito",
          data: result,
        });
      }
    }
  );
});

// Consultar empresa
app.get("/company/:id", (req, res) => {
  const companyId = req.params.id;
  db.query(
    `SELECT company_id, company, username, email, logo FROM company WHERE company_id=${companyId}`,
    (err, result) => {
      if (result.length > 0) {
        res.status(200).send(result[0]);
      } else {
        res.status(400).send({
          message: `No se encontró la empresa con el ID: ${companyId}`,
        });
      }
    }
  );
});

// Registrar una vacante
app.post("/job", (req, res) => {
  const title = req.body.title;
  const from_date = req.body.from_date;
  const until_date = req.body.until_date;
  const city = req.body.city;
  const job_type = req.body.job_type;
  const experience = req.body.experience;
  const company_id = req.body.company_id;
  db.query(
    `INSERT INTO job (title, from_date, until_date, city, job_type, experience, company_id) VALUES (?,?,?,?,?,?,?)`,
    [title, from_date, until_date, city, job_type, experience, company_id],
    (err, result) => {
      if (err) {
        res.status(400).send({
          message: err,
        });
      } else {
        res.status(201).send({
          status: 201,
          message: "Vacante creada con éxito",
          data: result,
        });
      }
    }
  );
});

// Consultar vacante
app.get("/job/:id", (req, res) => {
  const jobId = req.params.id;
  db.query(
    `SELECT job_id, title, from_date, until_date, city, job_type, experience, deleted, company_id FROM job WHERE job_id=${jobId}`,
    (err, result) => {
      if (result.length > 0) {
        res.status(200).send(result[0]);
      } else {
        res.status(400).send({
          message: `No se encontró la vacante con el ID: ${jobId}`,
        });
      }
    }
  );
});

// Editar una vacante
app.put("/job/:id", (req, res) => {
  const id = Number(req.params.id);
  const title = req.body.title;
  const from_date = req.body.from_date;
  const until_date = req.body.until_date;
  const city = req.body.city;
  const job_type = req.body.job_type;
  const experience = req.body.experience;
  const company_id = Number(req.body.company_id);

  db.query(
    `SELECT job_id, company_id FROM job WHERE job_id=${id}`,
    (err, result) => {
      if (result.length > 0) {
        let companyId = result[0].company_id;

        if (companyId == company_id) {
          db.query(
            `UPDATE job SET title=?, from_date=?, until_date=?, city=?, job_type=?, experience=? WHERE job_id=? AND company_id=?`,
            [title, from_date, until_date, city, job_type, experience, id, company_id],
            (err, result) => {
              if (err) {
                res.status(400).send({
                  message: err,
                });
              } else {
                res.status(200).send({
                  status: 200,
                  message: "Vacante actualizada con éxito",
                  data: result,
                });
              }
            }
          );
        } else {
          res.status(401).send({
            message:
              "La empresa no tiene autorización para actualizar esta vacante",
          });
        }
      } else {
        res.status(400).send({
          status: 400,
          message: `No se encontró la vacante con el ID: ${id}`,
        });
      }
    }
  );
});

// Eliminar una vacante
app.delete("/job/:id", (req, res) => {
  const id = Number(req.params.id);
  const company_id = Number(req.body.company_id);

  db.query(
    `SELECT job_id, company_id FROM job WHERE job_id=${id}`,
    (err, result) => {
      if (result.length > 0) {
        let companyId = result[0].company_id;

        if (companyId == company_id) {
          db.query(
            `UPDATE job SET deleted=1 WHERE job_id=? AND company_id=?`,
            [id, company_id],
            (err, result) => {
              if (err) {
                res.status(400).send({
                  message: err,
                });
              } else {
                res.status(200).send({
                  status: 200,
                  message: "Vacante Eliminada con éxito",
                  data: result,
                });
              }
            }
          );
        } else {
          res.status(401).send({
            message:
              "La empresa no tiene autorización para eliminar esta vacante",
          });
        }
      } else {
        res.status(400).send({
          status: 400,
          message: `No se encontró la vacante con el ID: ${id}`,
        });
      }
    }
  );
});

// Login de usuario
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  db.query(
    `SELECT company_id, company, username, email, logo FROM company WHERE email=? AND password=md5(?)`,
    [email, password],
    (err, result) => {
      if (err) {
        res.send({
          status: 500,
          message: err,
        });
      } else {
        if (result.length > 0) {
          res.status(200).send(result[0]);
        } else {
          res.status(401).send({
            status: 401,
            message: "Usuario o contraseña incorrectos",
          });
        }
      }
    }
  );
});

// Listar vacantes por empresa
app.get("/job/all/:company_id/:page/:limit", (req, res) => {
  const id = req.params.company_id;
  const page = req.params.page;
  const limit = req.params.limit;

  //Paginación
  const start = (page - 1 ) * limit

  db.query(
    `SELECT job_id, title, from_date, until_date, city, job_type, experience, deleted, company_id FROM job WHERE company_id=${id}  ORDER BY job_id DESC limit ${start}, ${limit}`,
    (err, result) => {
      if (result.length > 0) {
        res.status(200).send(result);
      } else {
        res.status(400).send({
          message: `No hay vacantes`,
        });
      }
    }
  );
});

// Listar todas las vacantes
app.get("/job/all/:page/:limit", (req, res) => {
  const page = req.params.page;
  const limit = req.params.limit;

  //Paginación
  const start = (page - 1 ) * limit

  db.query(
    `SELECT job_id, title, from_date, until_date, city, job_type, experience, deleted, company_id FROM job ORDER BY job_id DESC limit ${start}, ${limit}`,
    (err, result) => {
      if (result.length > 0) {
        res.status(200).send(result);
      } else {
        res.status(400).send({
          message: `No hay vacantes`,
        });
      }
    }
  );
});

// Registrar una persona
app.post("/person", (req, res) => {
  const dni = req.body.dni;
  const name = req.body.name;
  const email = req.body.email;
  const img = req.body.img;

  db.query(
    `INSERT INTO persons (dni, name, email, img) VALUES (?,?,?,?)`,
    [dni, name, email, img],
    (err, result) => {
      if (err) {
        res.status(400).send({
          message: err,
        });
      } else {
        res.status(201).send({
          status: 201,
          message: "Persona creada con éxito",
          data: result,
        });
      }
    }
  );
});

// Aplicar a una vacante
app.post("/apply", (req, res) => {
  const job_id = req.body.job_id;
  const persons_id = req.body.person_id;
  const salary = req.body.salary;

  db.query(
    `INSERT INTO job_persons_apply (job_job_id, persons_id, salary) VALUES (?,?,?)`,
    [job_id, persons_id, salary],
    (err, result) => {
      if (err) {
        res.status(400).send({
          message: err,
        });
      } else {
        res.status(201).send({
          status: 201,
          message: "Postulación hecha con éxito",
          data: result,
        });
      }
    }
  );
});

// Editar una postulación a una vacante
app.put("/apply/:job_id/:persons_id", (req, res) => {
  const job_id = req.params.job_id;
  const persons_id = req.params.persons_id;
  const deleted = req.body.deleted;
  const selected = req.body.selected;

  db.query(
    `UPDATE job_persons_apply SET deleted = ?, selected = ? WHERE persons_id = ? AND job_job_id = ?`,
    [deleted, selected, persons_id, job_id],
    (err, result) => {
      if (err) {
        res.status(400).send({
          message: err,
        });
      } else {
        res.status(201).send({
          status: 201,
          message: "Postulación actualizada con éxito",
          data: result,
        });
      }
    }
  );
});