const express = require("express");
const exphbs = require("express-handlebars");

const fs = require("fs");
const path = require("path");
const ejs = require('ejs');
const app = express();
const port = process.env.PORT || "8080";
const body_parser = require("body-parser");
app.engine(
  "html",
  exphbs({
    extname: ".html",
    helpers: {
      is_checked: function (val, truthy_val) {
        return val === truthy_val ? "checked" : "";
      },
      is_selected: function (val, selection) {
        return val === selection ? "selected" : "";
      },
    },
  })
);
const cookieParser = require("cookie-parser");
const cookieEncrypter = require("./cookie");
const secretKey = "foobarbaz1234567foobarbaz1234567";
const cookieParams = {
  httpOnly: true,
  signed: true,
  sameSite: "none",
  secure: true,
  
};
app.use(cookieParser(secretKey));
app.use(cookieEncrypter(secretKey));
app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, "public")));
app.use(body_parser.urlencoded({ extended: false }));
let authorized = false;
const auth = function (req, res, next) {
  
  if (req.path == "/login" || req.path == "/register") {
    return next();
  }

  if (req.signedCookies.cookie && req.signedCookies.cookie.auth) {
    authorized = true;
    return next();
  } else {
    authorized = false;
    return next();
  }
};

app.use(auth);
app.get("/", (req, res) => {
  let rawdata = fs.readFileSync(
    path.resolve(__dirname, "balloonatic-quotes.json")
  );
  let quotes = JSON.parse(rawdata);
  res.render("index", { data: quotes.quotes, authorized: authorized });
});

//product part
app.get("/shop", (req, res) => {
  let rawdata = fs.readFileSync(
    path.resolve(__dirname, "balloonatic-products.json")
  );
  let products = JSON.parse(rawdata);
  res.render("shop", { data: products, authorized: authorized });
});

app.get("/filter-category", (req, res) => {
  let category = req.query.category
  let rawdata = fs.readFileSync(
    path.resolve(__dirname, "balloonatic-products.json")
  );
  let filterProducts = {
    products: []
  }
  let products = JSON.parse(rawdata);
  for(let i=0;i<products.products.length;i++)
  {
    if(products.products[i].category==category)
    {
      filterProducts.products.push(products.products[i]);
    }
  }
  res.render("shop", { data: filterProducts, authorized: authorized });
});

//signin part
app.get("/login", (req, res) => {
  res.render("login", {errors: [],  authorized: authorized });
});

app.post("/login", async (req, res) => {
  const e = req.body;
  let userName = e.email;
  let password = e.password;
  if (!userName) {
    return res.render("login", {
      
      errors: [{ param: "Error", msg: "Email Address is must." }],
      e,
      authorized: authorized
    });
  }
  if (!password) {
    return res.render("login", {
     
      errors: [{ param: "Error", msg: "Password is must." }],
      e,
      authorized: authorized
    });
  }
  let rawdata = fs.readFileSync(
    path.resolve(__dirname, "balloonatic-users.json")
  );
  let user = JSON.parse(rawdata);
  let flag = 0;
  for (let i = 0; i < user.users.length; i++) {
    if (user.users[i].email == userName && user.users[i].password == password) {
      flag = 1;
      break;
    }
  }
  if (flag) {
    let setCookie = {
      auth: true,
    };
    res.cookie("cookie", setCookie, cookieParams);
    res.redirect("/");
  } else {
    return res.render("login", {
      errors: [{ param: "Error", msg: "Email or Password is incorrect." }],
      e,
      authorized: authorized
    });
  }
});

//logout part
app.get("/logout", (req, res) => {
  res.clearCookie("cookie");
  authorized = false;
  res.redirect("/");
});

//signup
app.get("/register", (req, res) => {
  res.render("register",{errors: [],  authorized: authorized });
});

app.post("/register", async (req, res) => {
  const e = req.body;
  let firstName = e.first_name;
  let lastName = e.last_name;
  let email = e.email;
  let address = e.address;
  let city = e.city;
  let postalCode = e.zipcode;
  let phone = e.phone;
  let password = e.password;
  let confirmPassword = e.confirm_password;

  if (!firstName) {
    console.log("fn");
    return res.render("register", {
      
      errors: [{ param: "Error", msg: "First Name is must." }],
      e,
      authorized: authorized
    });
  }
  if (!lastName) {
    console.log("fn");
    return res.render("register", {
      
      errors: [{ param: "Error", msg: "Last Name is must." }],
      e,
      authorized: authorized
    });
  }
  if (!phone) {
    console.log("ph");
    return res.render("register", {
      
      errors: [{ param: "Error", msg: "Phone Number is must." }],
      e,
      authorized: authorized
    });
  }
  if (!email) {
    console.log("em");
    return res.render("register", {
     
      errors: [{ param: "Error", msg: "Email is must." }],
      e,
      authorized: authorized
    });
  }
  if (!address) {
    console.log("em");
    return res.render("register", {
     
      errors: [{ param: "Error", msg: "Address is must." }],
      e,
      authorized: authorized
    });
  }
  if (!city) {
    console.log("em");
    return res.render("register", {
     
      errors: [{ param: "Error", msg: "City is must." }],
      e,
      authorized: authorized
    });
  }
  if (!postalCode) {
    console.log("em");
    return res.render("register", {
     
      errors: [{ param: "Error", msg: "PostalCode is must." }],
      e,
      authorized: authorized
    });
  }
  if (!password) {
    console.log("psw");
    return res.render("register", {
      
      errors: [{ param: "Error", msg: "Password is must." }],
      e,
      authorized: authorized
    });
  }
  if (!confirmPassword) {
    console.log("cmpw");
    return res.render("register", {
      
      errors: [{ param: "Error", msg: "confirmPassword is must." }],
      e,
      authorized: authorized
    });
  }
  if (confirmPassword != password) {
    console.log("notmatch");
    return res.render("register", {
      
      errors: [
        { param: "Error", msg: "Password and Confirm Password has to be same." },
      ],
      e,
      authorized: authorized
    });
  }

  let rawdata = fs.readFileSync(
    path.resolve(__dirname, "balloonatic-users.json")
  );
  let user = JSON.parse(rawdata);
  for (let i = 0; i < user.users.length; i++) {
    if (user.users[i].email == email) {
      return res.render("register", {
        errors: [{ param: "Error", msg: "User already exist. Try another name." }],
        e,
        authorized: authorized
      });
    }
  }
  let obj = {
    users: user.users,
  };
  let entity = {
    first_name: firstName,
    last_name: lastName,
    email: email,
    phone: phone,
    address: address,
    city: city,
    postalcode: postalCode,
    password: password,
  };
  obj.users.push(entity);
  fs.writeFile("balloonatic-users.json", JSON.stringify(obj), function (err) {
    if (err) throw err;
    console.log("complete");
  });
  res.redirect("/login",{ authorized: authorized });
});


app.get("/team", (req, res) => {
  res.render("team", { authorized: authorized });
});


app.get("/contact", (req, res) => {
  res.render("contact", { authorized: authorized ,errors: [],success:[]});
});

app.post("/contact", (req, res) => {
    const e = req.body;
    let email = e.emailInput
    if(!email){
        return res.render("contact", {
            errors: [{ param: "Error", msg: "Please enter email address." }],
            e,
            authorized: authorized,
            success:[] 
          });
    }
    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if(emailRegexp.test(email)){
       return res.render('contact', {
        success: [{ param: "success", msg: "Submission Successful." }],
        e,
        authorized: authorized ,
        errors: []
      });
    }else{
        return res.render("contact", {
            errors: [{ param: "Error", msg: "Please enter valid email address." }],
            e,
            authorized: authorized,
            success:[] 
          });
    }
});


app.get("/single", (req, res) => {
  res.render("single", { authorized: authorized });
});


app.get("/experiance", (req, res) => {
  res.render("experiance", { authorized: authorized });
});



//checkout part
app.get("/checkout", (req, res) => {
  res.render("checkout", { authorized: authorized });
});

app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});
