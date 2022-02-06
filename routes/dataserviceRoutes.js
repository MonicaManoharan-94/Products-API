const express = require('express')
const dataController = require('../controllers/dataController')
const authController = require('../controllers/authController')


const router = express.Router()

router
  .route('/top3brands')
  .get(
    authController.protect,
    dataController.setTop,
    dataController.selectAllProducts
  )

  router
  .route('/productstats')
  .get(
    authController.protect,
    dataController.getStats,
    dataController.selectAllProducts
  )

router
  .route('/products')
  .post(authController.protect, dataController.insertProducts)
  .get(authController.protect, dataController.selectAllProducts)

router
  .route('/products/:id')
  .get(authController.protect, dataController.selectProduct)
  .patch(authController.protect, dataController.patchProduct)
  .delete(authController.protect, dataController.deleteProduct)

module.exports = router

// {
//     "name": "product1",
//     "price": 22,
//     "description": "Test product",
//     "rating": 4.5
//     }

