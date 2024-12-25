const validation = (schema, property) => {
    return (req, res, next) => {
      let reqData = req.body;
      if (req.method === "GET") {
        reqData = Object.keys(req.params).length > 0 ? req.params : req.query;
      }
      const { error } = schema.validate(reqData);
      const valid = error == null;
      if (valid) {
        next();
      } else {
        const { details } = error;
        const message = details.map((i) => i.message).join(",");
        return res.status(422).json({
            message
        })
      }
    };
  };
  
  module.exports = validation;