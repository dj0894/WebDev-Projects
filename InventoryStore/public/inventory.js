"use strict";

(function iife() {


    const items = document.querySelector(".items-div .items");
    const inputElement = document.querySelector(".to-add-items .item-input");
    const status = document.querySelector('.status');
    const inputButton = document.querySelector(".to-add-items .add-btn");

    // translate error codes to human-friendly messages
    const errMsgs = {
        'duplicate': 'That item already exists',
        'network-error': 'There was a problem connecting to the network, try again',

    };


    function updateStatus(message) {
        status.innerText = message;
    }

    const inventory = {}

    disableButtonIfNoInput();
    fetchInitialInventory();

    //Rendering the UI using grid
    function renderInventory(inventory) {

        const html = Object.entries(inventory).map((item) => {
            return `
           <div class="grid-container">
                <div class="grid-item"><span class="item" data-index="${item[0]}">${item[0]}</span></div>
                <div class="grid-item"><span class="item" data-index="${item[0]}">${item[1].name}</span></div>
                <div class="grid-item"><span class="delete" data-index="${item[0]}">X</span></div>
                <div class="grid-item"><span class="decrease1 ${item[1].quantity == 0 ? "disabled" : ''}"  data-index="${item[0]}">-</sapn></div>     
                <div class="grid-item"><span id="quantity"class="qunatity" data-index="${item[0]}">${item[1].quantity}</span></div>
                <div class="grid-item"> <span class="increase1" data-index="${item[0]}">+</span></div>
            </div>
          `;
        }).join('');

        items.innerHTML = html;
        inputButton.disabled = !inputElement.value;

    };


    function convertError(response) {
        if (response.ok) {
            return response.json();
        }
        return response.json()
            .then(err => Promise.reject(err));
    }

    // Adding event handler on X button calling DELETE API 
    items.addEventListener('click', (e) => {
        // The below 'if' is making sure they clicked on the X
        // and not elsewhere in the list
        if (e.target.classList.contains('delete')) {
            const id = e.target.dataset.index;
            console.log(id);
            fetch(`/inventory/${id}`, {
                method: 'DELETE',
            })
                .catch(() => Promise.reject({ error: 'network-error' }))
                .then(convertError)
                .then(inventory => {
                    renderInventory(inventory);
                    updateStatus('');

                })
                .catch(err => {
                    console.log("error");
                    updateStatus(errMsgs[err.error] || err.error);
                });
        }

    });

    //Adding event handler on ADD button and calling POST api for creating inventory item
    inputButton.addEventListener('click', () => {
        const name = inputElement.value;
        if (name) {
            fetch(`/inventory/${name}`, {
                method: 'POST',
            })
                .catch(() => Promise.reject({ error: 'network-error' }))
                .then(convertError)
                .then(inventory => {
                    renderInventory(inventory);
                    inputElement.value = '';
                    updateStatus('');

                })
                .catch(err => {
                    updateStatus(errMsgs[err.error] || err.error);
                });
        }
    });


    //Adding event handler in items list on + button and calling PUT api for increasing the quantity by 1
    items.addEventListener('click', (e) => {
        if (e.target.classList.contains('increase1')) {
            const id = e.target.dataset.index;
            var body = {
                "quantityChange": 1
            }
            fetch(`/inventory/quantity/${id}`, {
                method: 'PUT',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                }
            })
                .catch(() => Promise.reject({ error: 'network-error' }))
                .then(convertError)
                .then(inventory => {
                    renderInventory(inventory);
                    updateStatus('');

                })
                .catch(err => {
                    console.log("error");
                    updateStatus(errMsgs[err.error] || err.error);
                });
        }

    });


    //Adding event handler in items list on - button and calling PUT api for decreasing the quantity by 1
    items.addEventListener('click', (e) => {
        if (e.target.classList.contains('decrease1')) {
            const id = e.target.dataset.index;

            var body = {
                "quantityChange": -1
            }
            fetch(`/inventory/quantity/${id}`, {
                method: 'PUT',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .catch(() => Promise.reject({ error: 'network-error' }))
                .then(convertError)
                .then(inventory => {
                    renderInventory(inventory);
                    updateStatus('');

                })
                .catch(err => {
                    console.log("error");
                    updateStatus(errMsgs[err.error] || err.error);
                });
        }

    });

    // Fetching  nventory data for for rendering
    function fetchInitialInventory() {
        fetch(`/inventory/items`, {
            method: 'GET'
        })
            .catch(() => Promise.reject({ error: 'network-error' }))
            .then(convertError)
            .then(inventory => {
                renderInventory(inventory);
                updateStatus('');

            })
            .catch(err => {
                console.log("error");
                updateStatus(errMsgs[err.error] || err.error);
            });
    }


    function disableButtonIfNoInput() {
        // Disable button if no text in input field
        inputElement.addEventListener('input', () => {
            inputButton.disabled = !inputElement.value;
            inputButton.classList.add('enabled-btn');

        });
    }


})();
