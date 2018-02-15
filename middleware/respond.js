module.exports = function () {
    return function(req,res,next){
        res.json(res.JSON);
    }
};