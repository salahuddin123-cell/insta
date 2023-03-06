const express = require('express');
const http = require('http')
const bodyParser = require('body-parser');
const Db = require('./database/db');
const cors = require('cors');
const app = express();
const bcrypt=require('bcryptjs')
const jwt = require('jsonwebtoken');
const server = http.createServer(app);
const socketIO = require('socket.io');
var path = require('path');

const port=process.env.PORT||8000
//const io = socketIO(server);
const mongoose = require('mongoose')
const dotenv = require("dotenv");

dotenv.config();
const fileuplad = require('express-fileupload')
const PostSchema = require('./model/createpost')
const CommentSchema = require('./model/comment')
const RegisterSchema = require('./model/register')
const FollowSchema = require('./model/follows')
const chatSchema=require('./model/chatschema')
const { Server } = require("socket.io");

const io = new Server(server
    ,{
    cors:{
        origin: "https://socialmediaaclone.netlify.app",
        optionsSuccessStatus: 200,
        credentials: true,
        methods: ["GET", "POST"],
    }
}
    
    );

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileuplad());
const router = express.Router();

server.listen(port, () => console.log(`it is running on http://localhost:${port}`));

mongoose.Promise = global.Promise;
mongoose.connect(process.env.BD_CONNECTION, () => console.log("database connected"))
app.use('/', router);

router.post('/post/new', (req, res) => {

    var dp = req.files.Dp;

    dp.mv('../client/public/images/' + dp.name, (err) => {
        if (err) {
            res.json({ "status": "File not uploaded" })
        } else {
            var insobj = {

                User: req.body.User,
                UserId: req.body.UserId,
                Description: req.body.Description,
                UserProfile: req.body.UserProfile,
                Profile: dp.name

            };

            PostSchema.create(insobj, (error, data) => {
                if (error) {
                    return next(error);
                } else {
                    console.log(data);
                    res.json(data);
                }
            });

        }
    })

})
const verifyJwt=(req,res,next)=>{
    const token=req.headers["x-access-token"]
    if(!token){
        res.send('You need a token')
    }else{
        jwt.verify(token,'mynameissalahuddinsksk',(err,_decoded)=>{
            if(err){
                res.json({auth:false,message:'wrong token'})
            }else{
              
                next()
            }
        })
    }
}
router.post("/post/all", function (req, res) {
    console.log(req.body)
    PostSchema.find({User:{$in:req.body.following}},(error, data) => {
        if (error) {
            return next(error);
        } else {
            res.json(data);
        }
    });
});
router.delete("/post/:id",
    (req, res, next) => {
        PostSchema.findByIdAndRemove(
            req.params.id, (error, data) => {
                if (error) {
                    return next(error);
                } else {
                    res.status(200).json({
                        msg: data,
                    });
                }
            });
    });
router.post('/register/new', (req, res) => {

    var dp = req.files.Dp;
   
    let dest=path.join(__dirname,"uploads")
    dp.mv(dest + dp.name, (err) => {
        if (err) {
            res.json({ "status": err,"log":__dirname })
        } else {
            var insobj = {

                Name: req.body.Name,
                Email: req.body.Email,
                Password:bcrypt.hashSync(req.body.Password,8),
                Profile: dp.name

            };

            RegisterSchema.create(insobj, (error, data) => {
                if (error) {
                    return next(error);
                } else {
                    console.log(data);
                    res.json(data);
                }
            });

        }
    })

})
router.post("/login",async(req,res)=>{
    const {Email,Password}=req.body
    const user=await RegisterSchema.findOne({Email:req.body.Email});
   
    if(!user){
     return  res.status(400).json({"success":"false"})
  }
  let isMatch=bcrypt.compare(Password,user.Password)
    
  
 if(!isMatch){
   return res.status(403).json({"responce":"password does not match"})
  }
 
 

  let token = jwt.sign( {"id":user._id},'mynameissalahuddinsksk',  { noTimestamp:true, expiresIn: '5m' });

res.cookie("JWT",token,{
  maxAge:606*24*30
})
res.status(200).json({
  token
})

})
router.get("/users/all", function (_req, res) {
    RegisterSchema.find((error, data) => {
        if (error) {
            return error;
        } else {
            res.json(data);
        }
    });
});
router.get("/users/:id", function (req, res) {

    RegisterSchema.findById(
        req.params.id, (error, data) => {
            if (error) {
                return error;
            } else {
                res.status(200).json({
                    msg: data,
                });
            }
        });
})

router.put('/users/:id', (req, res) => {

    var dp = req.files.Dp;

    dp.mv('../client/public/img/' + dp.name, (err) => {
        if (err) {
            res.json({ "status": "File not uploaded" })
        } else {
            var insobj = {

                Name: req.body.Name,

                Profile: dp.name

            };

            RegisterSchema.findByIdAndUpdate(
                req.params.id,
                {
                    $set: insobj,
                },
                (error, data) => {
                    if (error) {
                        return next(error);
                        console.log(error);
                    } else {
                        res.json(data);
                        console.log("Student updated successfully !");
                    }
                }
            );

        }
    })

})
router.put('/register/:id', (req, res) => {
   
    RegisterSchema.findById(req.params.id,(error,data)=>{
        if (error) {
            return error;
        } else {
           
            let following=data.Following
            following.push(req.body.Name)
           
            RegisterSchema.findByIdAndUpdate(
                req.params.id,
                {
                    $push: { Following: req.body.Name },
                },
                (error, _data) => {
                    if (error) {
                      console.log(error);
                    } else {
                       // res.json(data);
                    
                        RegisterSchema.findById(req.body.Id2,(error2,data2)=>{
                            if (error2) {
                                 console.log(error2);
                            } else {
                               
                                let follower=data2.Follower
                                follower.push(req.body.Name2)
                               
                                RegisterSchema.findByIdAndUpdate(
                                    req.body.Id2,
                                    {
                                        $set: { Follower: follower },
                                    },
                                    (error2, data2) => {
                                        if (error2) {
                                            console.log(error2)
                                          
                                        } else {
                                           res.json(data2);
                                            console.log("data2 updated successfully !"+req.body.Id2);
                                        }
                                    }
                                );
                            }
                        })
                    }
                }  
            );

         
        }
    })
   
})

router.put('/like/:id', (req, res) => {
   
    RegisterSchema.findById(req.params.id,(error,data)=>{
        if (error) {
            return error;
        } else {
           
            let likedbyme=data.Liked
            likedbyme.push(req.params.id)
           
            RegisterSchema.findByIdAndUpdate(
                req.params.id,
                {
                    $set: { Liked: likedbyme },
                },
                (error, _data) => {
                    if (error) {
                      console.log(error);
                    } else {
                       // res.json(data);
                    
                       PostSchema.findById(req.body.Id2,(error2,data2)=>{
                            if (error2) {
                                 console.log(error2);
                            } else {
                               
                                let likers=data2.Likers
                                likers.push(req.body.Name2)
                               
                                PostSchema.findByIdAndUpdate(
                                    req.body.Id2,
                                    {
                                        $set: { Likers: likers },
                                    },
                                    (error2, _data2) => {
                                        if (error2) {
                                            console.log(error2)
                                          
                                        } else {
                                           res.json(likers);
                                            console.log("data2 updated successfully !"+req.body.Id2);
                                        }
                                    }
                                );
                            }
                        })
                    }
                }  
            );

         
        }
    })
   
})

router.post("/comment/new", function (req, res) {
    CommentSchema.create(req.body, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.json(data);
        }
    });
});
router.post("/comment/all", function (req, res) {
   
    CommentSchema.find({PostId: req.body?.PostId} , (error, data) => {
        if (error) {
            
            return next(error);
        } else {
            
           
            res.json(data);
        }
    });
});
router.post("/follow/new", function (req, res) {
    FollowSchema.create(req.body, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.json(data);
        }
    });
});
router.get("/follow/all", function (_req, res) {
    FollowSchema.find((error, data) => {
        if (error) {
            return error;
        } else {
            res.json(data);
        }
    });
});

let users = [];
let users2=[]
const addUser=(id,user)=>{
 if(!users2.some(e=>e.user===user)){
    users2.push({id,user})
 }

}
const removeUser=(id)=>{
    users2=users2.filter(e=>e.id!==id)
}
let room;
io.on("connection", (socket) => {
 
    socket.on('getname',({User})=>{
       
        addUser(socket.id,User?.Name)
     
    })
    socket.on('joined', (data) => {
        
        users[socket.id] = data.user
        socket.join(data.room,()=>{
               
        })
        room=data.room
        console.log(` ${users[socket.id]} has joined the ${data.room}`)
        io.to(data.room).emit('welcome',{message:`hey ${users[socket.id]} welcome to ${data.room}`})
        io.to(data.room).emit('member',{users2})
    })
 

    socket.on("message", ({ msg, id ,me,time}) => {
        console.log(me,id,msg)
        io.to(me).emit('sendMessage', { user: users[id], message: msg, id: id ,time})
        const msgs=  new chatSchema({user:users[socket.id],message:msg,id:id,room:me,time})
        msgs.save()
    })
    socket.on('disconnect', () => {
        removeUser(socket.id)
        io.to(room).emit('member',{users2})
        socket.broadcast.emit('leave', { user: 'Admin', message: `${users[socket.id]} has left` })
       
    })

})

router.get("/chat/all",function (_req,res,next){
 
    chatSchema.find((error, data) => {
        if (error) {
        return next(error);
        } else {
        res.json(data);
      
        }
    });
    });
