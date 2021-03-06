const express = require("express");
let router = express.Router();
const jwt = require("jsonwebtoken");
const mailSender = require("../../../utils/mailer");
let SecModelClass = require('./sec.model.js');
let SecModel = new SecModelClass();

router.post('/login', async (req, res, next)=>{
  try {
    const {email, pswd} = req.body;
    //Validar los datos
    let userLogged = await SecModel.getByEmail(email);
    if (userLogged) {
      const isPswdOk = await SecModel.comparePassword(pswd, userLogged.password);
      if (isPswdOk) {
        // podemos validar la vigencia de la contraseña
        delete userLogged.password;
        delete userLogged.oldpasswords;
        delete userLogged.lastlogin;
        delete userLogged.lastpasswordchange;
        delete userLogged.passwordexpires;
        let payload = {
          jwt: jwt.sign(
            {
              email: userLogged.email,
              _id: userLogged._id,
              roles: userLogged.roles
            },
            process.env.JWT_SECRET,
            {expiresIn:'1d'}
          ),
          user: userLogged
        };
        return res.status(200).json(payload);
      }
    }
    console.log({email, userLogged});
    return res.status(400).json({msg: "Credenciales no son Válidas"});
  }catch (ex){
    console.log(ex);
    res.status(500).json({"msg":"Error"});
  }
});

router.post('/signin', async (req, res, next) => {
  try {
    const {email, pswd} = req.body;
    let userAdded = await SecModel.createNewUser(email, pswd);
    delete userAdded.password;
    console.log(userAdded);
    res.status(200).json({"msg":"Usuario Creado Satisfactoriamente"});
  } catch (ex) {
    res.status(500).json({ "msg": "Error" });
  }
});
/*
router.get('/passsrecovery', async (req, res, next)=>{
  mailSender(
    "Geovanyher98@gmail.com",
    "Test de Envio de Correo",
    '<h1>Esto es un prueba de correo</h1><p>Click aqui para setear contraseña <a href="http://localhost:3000/recovery">CLICK ME</></p>'
  );
  res.status(200).json({msg:"Email Sent!!!"});
});
*/

router.post('/pass', async (req, res)=>{
  try {
      const {email} = res.body;
      let uniqueId = v4();
      let insertUId = await userModel.insertUId(email, uniqueId)
      console.log(inserUId);
      mailSender(
          email,
          "Recuperar password",
          `<a>http://localhost:3000/api/users/resetPsw/${uniqueId}</a>`
      )
      res.status(200).json({"msg":"Email enviado"});
  } catch (err) {
      res.status(500).json({"msg": "Solicitud erronea" +err});
  }
})

router.post('/resetPsw/:id', async(req, res)=>{
  try {
      const {id}=req.params;
      const {newPsw} = req.body;
      const updatePsw = await userModel.changePassword(id, newPsw);
      console.log(updatePsw);
      res.status(200).json({msg: "Cambio de contraseña"})
  } catch (err) {
      res.status(500).json({"msg":"Error en cambio de contraseña" +err});
  }
})
module.exports = router;
