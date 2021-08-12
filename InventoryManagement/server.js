const express = require('express');
const app = express();
const PORT = 3000;


app.use(express.static('./public'));

const inventory = {
    "84c565a1-4358-4de4-a06b-1a3a08e89da9": {
        itemId: "4c565a1-4358-4de4-a06b-1a3a08e89da9",
        name: "Stuffed Mouse",
        quantity: 3,
    },
    "5cb2be78-8fb5-4c47-8f44-0ee434429590": {
        itemId: "5cb2be78-8fb5-4c47-8f44-0ee434429590",
        name: "Laser Pointer",
        quantity: 1,
    },
}


//GET API for getting object keys from inventory
app.get('/inventory', (req, res) => {
    res.json(Object.keys(inventory));
});

//GET API for getting all the inventory items along with item description
app.get('/inventory/items', (req, res) => {
    res.json(inventory);
});

//GET API for getting items on the basis of item key
app.get('/inventory/item/:id', (req, res) => {
    const id = req.params.id;
    if (inventory[id]) {
        res.json(inventory[id]);
    } else {
        res.status(404).json({ error: `Item dont exist in inventory: ${id}` });
    }
});


//POST API for creating the item with name provided 
app.post('/inventory/:name', express.json(), (req, res) => {
    const name = req.params.name.toLowerCase();

    const regex = /^[ A-Za-z]*$/;
    if (!name.match(regex)) {
        res.status(400).json({ error: 'Item name must be character of group of characters belonging to A-Z, a-z' });
        return;
    }

    if (!name) {
        res.status(400).json({ error: 'missing-name' });
        return;
    }

    //check if item already exist with same name in inventory
    const existingObjectNameLength = Object.values(inventory).filter(inv => inv.name == name).length;
    if (existingObjectNameLength > 0) {
        res.status(409).json({ error: 'duplicate' });
        return;
    }

    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    const id = uuidv4();
    const itemId = id
    const quantity = 0;

    inventory[id] = {
        itemId,
        name,
        quantity,
    };

    res.status(200).json(inventory);
});


//PUT API for updating quantity
app.put('/inventory/quantity/:id', express.json(), (req, res) => {
    const id = req.params.id;

    if (!id) {
        res.status(400).json({ error: 'missing-item' });
        return;
    }
    if (!inventory[id]) {
        res.status(400).json({ msg: 'item doesnot exist in database' });
    }

    const itemId = inventory[id].itemId;
    const name = inventory[id].name;
    const quantityChange = req.body.quantityChange
    const quantity = inventory[id].quantity + quantityChange;
    inventory[id] = {
        itemId,
        name,
        quantity
    };
    res.status(200).json(inventory);
});


//DELETE API for deleting item using object key
app.delete('/inventory/:id', (req, res) => {
    const id = req.params.id;
    if (!id) {
        res.status(400).json({ error: 'missing-item' });
        return;
    }
    delete inventory[id];
    res.status(200).json(inventory);

});


app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));