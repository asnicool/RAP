module.exports = function (ejs) {
    return function (req, res, next) {
        res.render(ejs,{data:res.JSON});
    }
};