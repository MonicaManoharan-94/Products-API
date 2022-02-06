const pool = require('../utils/database').pool
const catchAsync = require('../utils/catchAsync')

//aliasing
exports.setTop = async (req, res, next) => {
  req.query.limit = 3
  req.query.order = 'rating DESC'
  next()
}

exports.getStats = async (req, res, next) => {
  req.query.fields =
    'MIN(price) as minimumPrice,MAX(price) as maximumPrice,AVG(price) as avgPrice,AVG(rating) as avgRating,MIN(rating) as minimumRating,MAX(rating) as maximumRating'
  next()
}
exports.insertProducts = async (req, res, next) => {
  const { name, price, description, rating } = req.body

  try {
    const result = await pool.query(
      'INSERT INTO products(name,price,description,rating) VALUES($1,$2,$3,$4) ON CONFLICT (name) DO UPDATE SET (price, description, rating) = ($2,$3,$4)',
      [name, price, description, rating]
    )
    res.status(200).send('Data updated successfully')
  } catch (error) {
    res.status(500).send('Something went wrong' + error.message)
  }
}

queryexec = async (query, req, res, page, limit) => {
  //pagination and query execution
  query += ' LIMIT $2 OFFSET (($1 - 1) * $2);'
  console.log(query)
  const data = await pool.query(query, [page, limit])
  console.log(data.rows)
  res.status(201).json(data.rows)
}

exports.selectAllProducts = async (req, res, next) => {
  try {
    //filtering
    var { fields = '', page = 1, limit = 2, order = {}, ...cond } = req.query
    var stdobj = []
    if (fields == '' && order == {} && cond == {}) {
      var querystr = 'SELECT * FROM products'
      queryexec(querystr, req, res, page, limit)
    } else {
      if (fields != '') {
        var fields = fields.split(',')
        console.log(fields)
        var tmpstr = []
        stdobj.push('SELECT ')
        for (let i = 0; i < fields.length; i++) {
          if (fields.length == 1 || i == 0) {
            querystr = ' ' + fields[i]
          } else {
            querystr = ',' + fields[i]
          }
          tmpstr.push(querystr)
        }
        stdobj.push(tmpstr.join(''))
        stdobj.push(' FROM products')
      } else {
        stdobj.push('SELECT * FROM products')
      }
      if (Object.keys(cond).length > 0) {
        stdobj.push(' WHERE ')
        var count = 0
        tmparr = []
        for (let [x, y] of Object.entries(cond)) {
          if (typeof y === 'object') {
            for (let [z, a] of Object.entries(y)) {
              const key = x
              if (!parseFloat(a)) {
                var querynew = key + z + "'" + a + "'"
              } else {
                var querynew = key + z + a
              }
            }
          } else {
            if (!parseFloat(y)) {
              var querynew = x + '=' + "'" + y + "'"
            } else {
              var querynew = x + '=' + y
            }
          }

          tmparr.push(querynew)
          if (tmparr.length >= 1) {
            if (count !== Object.keys(cond).length - 1) tmparr.push(' AND ')
            tmparr.push(' ')
          } else {
            tmparr.push(' ')
          }
          count = count + 1
        }
        var querystr = tmparr.join('')
        stdobj.push(querystr)
      }
      if (Object.keys(order).length !== 0) {
        stdobj.push(' ORDER BY')
        var querystr = ''
        var i = 0
        for (let [x, y] of Object.entries(order)) {
          if (i == 0 || i == Object.keys.length(order) - 1) {
            if (x == 'ASC' || x == 'DESC') {
              querystr = ' ' + y + ' ' + x
            } else {
              querystr = ' ' + y
            }
            stdobj.push(querystr)
          } else {
            if (x == 'ASC' || x == 'DESC') {
              querystr = ',' + y + ' ' + x
            } else {
              querystr = ',' + y
            }
            stdobj.push(querystr)
          }
          i = i + 1
        }
      }

      var querystr = stdobj.join('')
      queryexec(querystr, req, res, page, limit)
    }
  } catch (error) {
    res.status(500).send('Something went wrong' + error.message)
  }
}

exports.selectProduct = async (req, res, next) => {
  const id = req.params.id
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE product_id=$1',
      [id]
    )
    res.status(201).json(result.rows)
    console.log(result.rows)
  } catch (error) {
    res.status(500).send('Internal Server Error' + error.message)
  }
}

exports.patchProduct = async (req, res, next) => {
  const id = req.params.id
  const patchItems = req.body
  console.log(patchItems)
  try {
    for (const x in patchItems) {
      //console.log(x, patchItems[x])
      if (x && patchItems[x]) {
        if (
          typeof patchItems[x] === 'string' ||
          patchItems[x] instanceof String
        )
          var updateStr =
            'UPDATE products SET ' +
            x +
            " = '" +
            patchItems[x] +
            "' WHERE product_id = " +
            id
        else
          var updateStr =
            'UPDATE products SET ' +
            x +
            ' = ' +
            patchItems[x] +
            ' WHERE product_id = ' +
            id
        console.log(updateStr)
        const result = await pool.query(updateStr)
        res.status(201).send('Data updated in database')
      }
    }
  } catch (err) {
    res.status(500).send('Something went wrong' + err.message)
  }
}

exports.deleteProduct = async (req, res, next) => {
  const id = req.params.id
  try {
    const result = await pool.query(
      'DELETE FROM products WHERE product_id=$1',
      [id]
    )
    res.status(201).send('Data deleted in database')
    console.log(data.rows)
  } catch (error) {
    res.status(500).send('Something went wrong' + error.message)
  }
}

// {
//   "username": "monica.monica",
//   "password": "monicapassword"
// }
