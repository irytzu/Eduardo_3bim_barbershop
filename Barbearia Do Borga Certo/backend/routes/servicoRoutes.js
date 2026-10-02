const express = require('express');
const router = express.Router();
const servicoController = require('../controllers/servicoController');

router.get('/listar', servicoController.listarServicos);
router.get('/:id', servicoController.obterServico);
router.post('/', servicoController.criarServico);
router.put('/:id', servicoController.atualizarServico);
router.delete('/:id', servicoController.deletarServico);

module.exports = router;