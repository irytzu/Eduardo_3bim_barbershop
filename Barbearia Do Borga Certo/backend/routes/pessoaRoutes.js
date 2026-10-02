const express = require('express');
const router = express.Router();
const pessoaController = require('../controllers/pessoaController');

router.get('/listar', pessoaController.listarPessoas);
router.get('/:id', pessoaController.obterPessoa);
router.post('/', pessoaController.criarPessoa);
router.put('/:id', pessoaController.atualizarPessoa);
router.delete('/:id', pessoaController.deletarPessoa);

module.exports = router;