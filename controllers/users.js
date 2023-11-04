const User = require('../models/user');

module.exports.renderLoginChoose = (req, res) => {
    res.render('users/login_choose');
}

module.exports.renderRegisterChoose = (req, res) => {
    res.render('users/Register_choose');
}


module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) {
                return next(err);
            }
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
    }

    catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }


}

module.exports.renderRegisterAdmin = (req, res) => {
    res.render('users/registeradmin')
}

module.exports.registerAdmin = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username, admin: true });
        const registeredUser = await User
            .register(user, password);
        req.login(registeredUser, err => {
            if (err) {
                return next(err);
            }
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
    }

    catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }


}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');

}

module.exports.renderLoginAdmin = (req, res) => {
    res.render('users/loginadmin');

}


module.exports.Login = (req, res) => {
    req.flash('success', 'Welcome back');
    const redirectUrl = res.locals.returnTo || '/complaint';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.LoginAdmin = (req, res) => {
    req.flash('success', 'Welcome back');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.Logout = (req, res) => {

    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Logout successful')
        res.redirect('/campgrounds');
    });
}