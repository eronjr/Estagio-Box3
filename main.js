'use strict'

const token = "fdb52c51-2c99-4efd-bd42-463ce0e2d832"
const url = "https://api.box3.work/api/Contato"

let data = null
let idClient = null

// Função para formatar o campo de telefone com o código de área e o número do telefone
function mask(o, f) {
    setTimeout(function() {
        let v = mphone(o.value);
        if (v != o.value) {
        o.value = v;
        }
    }, 1);
  }
  
function mphone(v) {
    let r = v.replace(/\D/g, "");
    r = r.replace(/^0/, "");
    if (r.length > 10) {
        r = r.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
    } else if (r.length > 5) {
        r = r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    } else if (r.length > 2) {
         r = r.replace(/^(\d\d)(\d{0,5})/, "($1) $2");
    } else {
          r = r.replace(/^(\d*)/, "($1");
    }
    return r;
}

// Modal
const openModal = () => document.getElementById('modal')
    .classList.add('active')

const closeModal = () => {
    clearFields()
    document.getElementById('modal').classList.remove('active')
}

const clearTable = () => {
    const rows = document.querySelectorAll('#tableClient>tbody tr')
    rows.forEach(row => row.remove())
}

const getData = async () => {
  try {
    const res = await fetch(`${url}/${token}`)
    const json = await res.json()
    
    clearTable()
    json.forEach(createRow)
  }    catch(e) {
      console.error(e)
  }
}

const updateTable = () => {
    clearTable()
    readClient()
}

const deleteContact = (id) => {
    fetch(`${url}/${token}/${id}`, { method: "DELETE" })
        .then((res) => {
            if (res.status == 200) {
                updateTable()
            }
        })
        .catch((e) => console.error(e))
}

const updateClient = (index, client) => {
    fetch(`${url}/${token}/${index}`, {
        method: "PUT",
        body: JSON.stringify(client),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(() => {
        getData()
    })
    .catch(() => { console.log("Ocorreu um erro na atualização.") })
}

const readClient = () => getData()

const createClient = (client) => {
    fetch(`${url}/${token}`, {
        method: "POST",
        body: JSON.stringify(client),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
    })
    .then(() => {
        updateTable()
    })
    .catch(() => {
        console.log("Erro ao criar cliente")
    })
}

const isValidFields = () => {
    return document.getElementById('form').reportValidity()
}

const clearFields = () => {
    const fields = document.querySelectorAll('.modal-field')
    fields.forEach(field => field.value = "")
    document.getElementById('nome').dataset.index = 'new'
}

const saveContact = () => {
    if (isValidFields()) {
        const client = {
            nome: document.getElementById('nome').value,
            telefone: document.getElementById('telefone').value,
            email: document.getElementById('email').value,
            ativo: String(document.getElementById('ativo').checked),
            dataNascimento: document.getElementById('dataNascimento').value
        }
        const index = document.getElementById('nome').dataset.index 
        if (index == 'new') {
            createClient(client)
            updateTable()
            closeModal()
        } else {
            updateClient(idClient, client)
            updateTable()
            closeModal()
        }
    }
}

const config = {
    method: "POST",
    body: JSON.stringify(data),
    headers: {"Content-type": "application/json; charset=UTF-8"}
}

const createRow = (client, index) => {
    const newRow = document.createElement('tr')
    newRow.className = `tr-${client.id}`
    newRow.innerHTML = `
        <td>${client.nome}</td>
        <td>${client.telefone}</td>
        <td>${client.email}</td>
        <td>${client.ativo ? ("<span>Ativado</span>") : ("<span>Desativado</span>") }</td>            
        <td>${new Date(client.dataNascimento).toLocaleDateString("pt-BR")}</td>
        <td>
            <button type="button" class="button green" id="edit-${client.id}">Editar</button>
            <button type="button" class="button red" id="delete-${client.id}">Excluir</button>
        </td>
    `
    document.querySelector('#tableClient>tbody').appendChild(newRow)
}

const formatDate = (date) => {
    return date.split("/").reverse().join("-")
}

const fillFields = (client) => {
    document.getElementById('nome').value = client.nome
    document.getElementById('telefone').value = client.telefone
    document.getElementById('email').value = client.email
    document.getElementById('ativo').checked = client.ativo
    document.getElementById('nome').dataset.index = client.index
    document.getElementById('dataNascimento').value = formatDate(client.dataNascimento)
}

const editClient = (index) => {
    const client = document.querySelector(`.tr-${index}`)

    const data = {
        nome: client.children[0].innerText,
        telefone: client.children[1].innerText,
        email: client.children[2].innerText,
        ativo: client.children[3].innerText === "Ativado" ? true : false,
        dataNascimento: client.children[4].innerText
    }

    idClient = index
    fillFields(data)
    openModal()
}

const editDelete = (event) => {
    if (event.target.type == 'button') {

        const [action, index] = event.target.id.split('-')

        if (action == 'edit') {
            editClient(index)
        } else {
            const response = confirm(`Deseja realmente excluir esse cliente?`)
            if (response) {
                deleteContact(index)
                updateTable()
            }
        }
    }
}

getData()

// Eventos
document.getElementById('cadastrarContato')
    .addEventListener('click', openModal)

document.getElementById('modalClose')
    .addEventListener('click', closeModal)

document.getElementById('salvar')
    .addEventListener('click', saveContact)

document.querySelector('#tableClient>tbody')
    .addEventListener('click', editDelete)

document.getElementById('cancelar')
    .addEventListener('click', closeModal)