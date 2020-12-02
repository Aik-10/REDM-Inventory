GetShop = function ( type ) {

    if (type == "generalStore") {
        let shopItems = [
            {item_id: "canned_apricots", id: 0, name: "Shop", information: "{}", slot: 1, amount: 50},
            {item_id: "canned_corned_beef", id: 0, name: "Shop", information: "{}", slot: 2, amount: 50},
            {item_id: "canned_kidney_beans", id: 0, name: "Shop", information: "{}", slot: 3, amount: 50},
            {item_id: "canned_peaches", id: 0, name: "Shop", information: "{}", slot: 4, amount: 50},
            {item_id: "canned_peas", id: 0, name: "Shop", information: "{}", slot: 5, amount: 50},
            {item_id: "canned_pineapples", id: 0, name: "Shop", information: "{}", slot: 6, amount: 50},
        ];
        return JSON.stringify(shopItems);

    }

    else if (type == "weaponStore") {
        let shopItems = [
            {item_id: 379542007, id: 0, name: "Shop", information: "{}", slot: 1, amount: 1},
            {item_id: 1742487518, id: 0, name: "Shop", information: "{}", slot: 2, amount: 1},
            {item_id: 710736342, id: 0, name: "Shop", information: "{}", slot: 3, amount: 1},
            {item_id: -2002235300, id: 0, name: "Shop", information: "{}", slot: 4, amount: 1},

        ];
        return JSON.stringify(shopItems);
         
    } 
    
    else if (type == "saloon") {
        let shopItems = [
            {item_id: "healt_cure", id: 0, name: "Shop", information: "{}", slot: 1, amount: 50},
            {item_id: "miracle_tonic", id: 0, name: "Shop", information: "{}", slot: 2, amount: 50},
            {item_id: "potent_healt_cure", id: 0, name: "Shop", information: "{}", slot: 3, amount: 50},
            {item_id: "kentucky_bourbon", id: 0, name: "Shop", information: "{}", slot: 4, amount: 50},            

        ];
        return JSON.stringify(shopItems);
        saloon 
    } else {
        return false;
    }
}