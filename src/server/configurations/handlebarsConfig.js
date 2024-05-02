const handlebars = require('express-handlebars')

const handlebarsConfig = function(app){
app.engine('hbs', handlebars.engine({ extname: "hbs" }));
app.set('view engine', 'hbs');
app.set('views', 'src/server/views');
}

module.exports = handlebarsConfig;