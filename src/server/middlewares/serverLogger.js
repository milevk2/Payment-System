function serverLogger(req, res, next) {

    const date = new Date(Date.now());
    const day = format(date.getDate());
    const month = format(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = format(date.getHours());
    const minutes = format(date.getMinutes());
    const seconds = format(date.getSeconds());

    console.log(`<${day}/${month}/${year}:${hours}:${minutes}:${seconds}>: ${req.path}`);
    next();
}

function format(parameters) {

    return String(parameters).padStart(2, '0');
}


module.exports = serverLogger;