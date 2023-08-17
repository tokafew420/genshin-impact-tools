// Require necessary modules and data for character and weapon information
app.require(['characters', 'weapons', 'elements', 'resources', 'character-talent-level-up', 'weapon-ascension'],
    function (characters, weapons, elements, resources, characterTalentLeventUp, weaponAscension) {
        // Loop through each element on the page and populate with appropriate card
        var $elements = $('[data-resource-type]').each(function () {
            var $this = $(this);
            var type = $this.attr('data-resource-type');
            var name = $this.attr('data-resource-name');

            // Based on the element type, create and append corresponding card
            if (type === 'resource') {
                let card = app.makeResourceCard(name);
                if (card) $this.append(card);
            } else if (type === 'character') {
                let card = app.makeCharacterCard(name);
                if (card) $this.append(card);
            } else if (type === 'weapon') {
                let card = app.makeWeaponCard(name);
                if (card) $this.append(card);
            }
        });

        // Process character talent and level up materials
        var characterMats = characterTalentLeventUp.map((a) => {
            if (a.name) {
                // Find corresponding character for each talent/level data
                var character = app.getCharacter(a.name);
                if (character) {
                    // Calculate character's required materials based on their talent and level data
                    if (character.name.startsWith('Traveler')) {
                        character.materials = (a.normal_attack_levels || []).map((l) => l.materials)
                            .concat(a.levels.map((l) => l.materials))
                            .flat()
                            .map((m) => m.name)
                            .filter(app.filters.distinct);
                    } else {
                        character.materials = a.materials.map((m) => m.name);
                    }

                    return character;
                }
            }
        }).filter(app.filters.notNullOrUndefined);

        // Sort characters based on their names
        app.sortByCharacters(characterMats);

        // Populate elements with character cards based on required materials
        $('[data-character-resource]').each(function () {
            var $this = $(this);
            var resources = ($this.attr('data-character-resource') || '').split(',');
            // Loop through characters with required materials and add their cards to the element
            characterMats.forEach((c) => {
                if (app.any(resources, (r) => c.materials.indexOf(r) !== -1)) {
                    let $card = app.makeCharacterCard(c.name);
                    if ($card) $this.append($card.addClass('searchable'));
                }
            });
        });

        // Process weapon ascension materials
        var weaponMats = weaponAscension.map((a) => {
            if (a.name) {
                // Find corresponding weapon for each ascension data
                var weapon = app.getWeapon(a.name);
                if (weapon) {
                    // Calculate weapon's required materials based on its ascension data
                    weapon.materials = a.materials.map((m) => m.name);

                    return weapon;
                }
            }
        }).filter(app.filters.notNullOrUndefined);
        // Sort weapons based on their names
        app.sortByCharacters(weaponMats);

        // Populate elements with weapon cards based on required materials
        $('[data-weapon-resource]').each(function () {
            var $this = $(this);
            var resources = ($this.attr('data-weapon-resource') || '').split(',');
            // Loop through weapons with required materials and add their cards to the element
            weaponMats.forEach((w) => {
                if (app.any(resources, (r) => w.materials.indexOf(r) !== -1)) {
                    let $card = app.makeWeaponCard(w.name);
                    if ($card) $this.append($card.addClass('searchable'));
                }
            });
        });
    });