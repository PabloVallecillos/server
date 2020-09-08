const User = require('../models/auth.model');
const expressJwt = require('express-jwt');
const path = require('path');
const fs = require('fs');

exports.uploadController = (req, res) => {

  if (req.files === null) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }

  const file = req.files.file;
  
  let dir = `${path.dirname(__dirname)}/client/public/uploads/${req.user._id}`;
  let pathFile = `${dir}/${file.name}`;
  
  if (!fs.existsSync(dir)) {
    fs.mkdir(dir, (err) => {
      if (err) {
        throw err;
      }
    });
  }else if (fs.existsSync(pathFile)){
    //  User.findOne({_id: req.user._id}, (err, user)=> {

    //    user.image.src = file.name
    //    if(err){
    //      console.error(err)
    //      return res.status(500).send(err);
    //    }
  
    //    user.save()
    //   //  res.json({
    //   //   fileName: file.name,
    //   //   filePath: `/uploads/${req.user._id}/${file.name}`,
    //   // })
    // });
     return res.status(400).json({ msg: 'File uploaded' })
      
  }

  file.mv( pathFile , (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }
    User.findOne({_id: req.user._id}, (err, user)=> {
    
      user.image.src = file.name
  
      if(err){
        console.error(err)
        return res.status(500).send(err);
      }
      
      user.save();

      res.json({
        fileName: file.name,
        filePath: `/uploads/${req.user._id}/${file.name}`,
      });
    })
    
  });
};

exports.readController = (req, res) => {
  console.log(req.params);
  const userId = req.params.id;
  User.findById(userId).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found',
      });
    }
    user.hashed_password = undefined;
    user.salt = undefined;
    res.json(user);
  });
};

exports.updateController = (req, res) => {
  // console.log('UPDATE USER - req.user', req.user, 'UPDATE DATA', req.body);
  const { name, password, image } = req.body;
  

  User.findOne({ _id: req.user._id }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found',
      });
    }
    if (!name) {
      return res.status(400).json({
        error: 'Name is required',
      });
    } else {
      user.name = name;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          error: 'Password should be min 6 characters long',
        });
      } else {
        user.password = password;
      }
    }

    if(image) {
      user.image = image;
    }

    user.save((err, updatedUser) => {
      if (err) {
        console.log('USER UPDATE ERROR', err);
        return res.status(400).json({
          error: 'User update failed',
        });
      }
      updatedUser.hashed_password = undefined;
      updatedUser.salt = undefined;
      res.json(updatedUser);
    });
  });
};
