function generateId(id_type) {

    let id = id_type;
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    for (let i = 1; i <= 10; i++) {

        let character = '';

        if (i % 2 == 0) {

            character = Math.floor(Math.random() * 10);
            id = id.concat(character);
            continue;
        }

        character = letters[Math.floor(Math.random() * letters.length)];
        id = id.concat(character);
    }
    return id;
}

module.exports = generateId;