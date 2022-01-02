app.require(['characters', 'weapons', 'elements', 'resources', 'character-talent-level-up', 'weapon-ascension'],
    function (characters, weapons, elements, resources, characterTalentLeventUp, weaponAscension) {
        var $elements = $('[data-resource-type]').each(function () {
            var $this = $(this);
            var type = $this.attr('data-resource-type');
            var name = $this.attr('data-resource-name');
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

        var characterMats = characterTalentLeventUp.map((a) => {
            if (a.name) {
                var character = app.getCharacter(a.name);
                if (character) {
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
        app.sortByCharacters(characterMats);

        $('[data-character-resource]').each(function () {
            var $this = $(this);
            var resources = ($this.attr('data-character-resource') || '').split(',');
            characterMats.forEach((c) => {
                if (app.any(resources, (r) => c.materials.indexOf(r) !== -1)) {
                    let $card = app.makeCharacterCard(c.name);
                    if ($card) $this.append($card.addClass('searchable'));
                }
            });
        });

        var weaponMats = weaponAscension.map((a) => {
            if (a.name) {
                var weapon = app.getWeapon(a.name);
                if (weapon) {
                    weapon.materials = a.materials.map((m) => m.name);

                    return weapon;
                }
            }
        }).filter(app.filters.notNullOrUndefined);
        app.sortByCharacters(weaponMats);

        $('[data-weapon-resource]').each(function () {
            var $this = $(this);
            var resources = ($this.attr('data-weapon-resource') || '').split(',');
            weaponMats.forEach((w) => {
                if (app.any(resources, (r) => w.materials.indexOf(r) !== -1)) {
                    let $card = app.makeWeaponCard(w.name);
                    if ($card) $this.append($card.addClass('searchable'));
                }
            });
        });
    });