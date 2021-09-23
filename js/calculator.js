app.require(['characters', 'elements', 'resources', 'character-ascension', 'character-talent-level-up'],
    function (characters, elements, resources, characterAscension, characterTalentLeventUp) {

        var sortOrder = {
            "Mora": 0,
            "Wanderer's Advice": 1,
            "Adventurer's Experience": 2,
            "Hero's Wit": 3,
            "Brilliant Diamond Sliver": 4,
            "Brilliant Diamond Fragment": 5,
            "Brilliant Diamond Chunk": 6,
            "Brilliant Diamond Gemstone": 7,
            "Agnidus Agate Sliver": 8,
            "Agnidus Agate Fragment": 9,
            "Agnidus Agate Chunk": 10,
            "Agnidus Agate Gemstone": 11,
            "Varunada Lazurite Sliver": 12,
            "Varunada Lazurite Fragment": 13,
            "Varunada Lazurite Chunk": 14,
            "Varunada Lazurite Gemstone": 15,
            "Vajrada Amethyst Sliver": 16,
            "Vajrada Amethyst Fragment": 17,
            "Vajrada Amethyst Chunk": 18,
            "Vajrada Amethyst Gemstone": 19,
            "Vayuda Turquoise Sliver": 20,
            "Vayuda Turquoise Fragment": 21,
            "Vayuda Turquoise Chunk": 22,
            "Vayuda Turquoise Gemstone": 23,
            "Shivada Jade Sliver": 24,
            "Shivada Jade Fragment": 25,
            "Shivada Jade Chunk": 26,
            "Shivada Jade Gemstone": 27,
            "Prithiva Topaz Sliver": 28,
            "Prithiva Topaz Fragment": 29,
            "Prithiva Topaz Chunk": 30,
            "Prithiva Topaz Gemstone": 31,
            "Hurricane Seed": 32,
            "Lightning Prism": 33,
            "Basalt Pillar": 34,
            "Crystalline Bloom": 35,
            "Smoldering Pearl": 36,
            "Dew of Repudiation": 37,
            "Hoarfrost Core": 38,
            "Everflame Seed": 39,
            "Cleansing Heart": 40,
            "Juvenile Jade": 41,
            "Marionette Core": 42,
            "Perpetual Heart": 43,
            "Storm Beads": 44,
            "Amakumo Fruit": 45,
            "Calla Lily": 46,
            "Cecilia": 47,
            "Cor Lapis": 48,
            "Crystal Marrow": 49,
            "Dandelion Seed": 50,
            "Dendrobium": 51,
            "Glaze Lily": 52,
            "Jueyun Chili": 53,
            "Naku Weed": 54,
            "Noctilucous Jade": 55,
            "Onikabuto": 56,
            "Philanemo Mushroom": 57,
            "Qingxin": 58,
            "Sakura Bloom": 59,
            "Sango Pearl": 60,
            "Sea Ganoderma": 61,
            "Silk Flower": 62,
            "Small Lamp Grass": 63,
            "Starconch": 64,
            "Valberry": 65,
            "Violetgrass": 66,
            "Windwheel Aster": 67,
            "Wolfhook": 68,
            "Teachings of Freedom": 69,
            "Guide to Freedom": 70,
            "Philosophies of Freedom": 71,
            "Teachings of Resistance": 72,
            "Guide to Resistance": 73,
            "Philosophies of Resistance": 74,
            "Teachings of Ballad": 75,
            "Guide to Ballad": 76,
            "Philosophies of Ballad": 77,
            "Teachings of Prosperity": 78,
            "Guide to Prosperity": 79,
            "Philosophies of Prosperity": 80,
            "Teachings of Diligence": 81,
            "Guide to Diligence": 82,
            "Philosophies of Diligence": 83,
            "Teachings of Gold": 84,
            "Guide to Gold": 85,
            "Philosophies of Gold": 86,
            "Teachings of Transience": 87,
            "Guide to Transience": 88,
            "Philosophies of Transience": 89,
            "Teachings of Elegance": 90,
            "Guide to Elegance": 91,
            "Philosophies of Elegance": 92,
            "Teachings of Light": 93,
            "Guide to Light": 94,
            "Philosophies of Light": 95,
            "Slime Condensate": 96,
            "Slime Secretions": 97,
            "Slime Concentrate": 98,
            "Damaged Mask": 99,
            "Stained Mask": 100,
            "Ominous Mask": 101,
            "Divining Scroll": 102,
            "Sealed Scroll": 103,
            "Forbidden Curse Scroll": 104,
            "Firm Arrowhead": 105,
            "Sharp Arrowhead": 106,
            "Weathered Arrowhead": 107,
            "Heavy Horn": 108,
            "Black Bronze Horn": 109,
            "Black Crystal Horn": 110,
            "Dead Ley Line Branch": 111,
            "Dead Ley Line Leaves": 112,
            "Ley Line Sprout": 113,
            "Chaos Device": 114,
            "Chaos Circuit": 115,
            "Chaos Core": 116,
            "Mist Grass Pollen": 117,
            "Mist Grass": 118,
            "Mist Grass Wick": 119,
            "Hunter's Sacrificial Knife": 120,
            "Agent's Sacrificial Knife": 121,
            "Inspector's Sacrificial Knife": 122,
            "Recruit's Insignia": 123,
            "Sergeant's Insignia": 124,
            "Lieutenant's Insignia": 125,
            "Treasure Hoarder Insignia": 126,
            "Silver Raven Insignia": 127,
            "Golden Raven Insignia": 128,
            "Whopperflower Nectar": 129,
            "Shimmering Nectar": 130,
            "Energy Nectar": 131,
            "Fragile Bone Shard": 132,
            "Sturdy Bone Shard": 133,
            "Fossilized Bone Shard": 134,
            "Old Handguard": 135,
            "Kageuchi Handguard": 136,
            "Famed Handguard": 137,
            "Chaos Gear": 138,
            "Chaos Axis": 139,
            "Chaos Oculus": 140,
            "Dismal Prism": 141,
            "Crystal Prism": 142,
            "Polarizing Prism": 143,
            "Spectral Husk": 144,
            "Spectral Heart": 145,
            "Spectral Nucleus": 146,
            "Dvalin's Plume": 147,
            "Dvalin's Claw": 148,
            "Dvalin's Sigh": 149,
            "Tail of Boreas": 150,
            "Ring of Boreas": 151,
            "Spirit Locket of Boreas": 152,
            "Tusk of Monoceros Caeli": 153,
            "Shard of a Foul Legacy": 154,
            "Shadow of the Warrior": 155,
            "Dragon Lord's Crown": 156,
            "Bloodjade Branch": 157,
            "Gilded Scale": 158,
            "Molten Moment": 159,
            "Hellfire Butterfly": 160,
            "Ashen Heart": 161,
            "Crown of Insight": 162,
            "Tile of Decarabian's Tower": 163,
            "Debris of Decarabian's City": 164,
            "Fragment of Decarabian's Epic": 165,
            "Scattered Piece of Decarabian's Dream": 166,
            "Boreal Wolf's Milk Tooth": 167,
            "Boreal Wolf's Cracked Tooth": 168,
            "Boreal Wolf's Broken Fang": 169,
            "Boreal Wolf's Nostalgia": 170,
            "Fetters of the Dandelion Gladiator": 171,
            "Chains of the Dandelion Gladiator": 172,
            "Shackles of the Dandelion Gladiator": 173,
            "Dream of the Dandelion Gladiator": 174,
            "Luminous Sands from Guyun": 175,
            "Lustrous Stone from Guyun": 176,
            "Relic from Guyun": 177,
            "Divine Body from Guyun": 178,
            "Mist Veiled Lead Elixir": 179,
            "Mist Veiled Mercury Elixir": 180,
            "Mist Veiled Gold Elixir": 181,
            "Mist Veiled Primo Elixir": 182,
            "Grain of Aerosiderite": 183,
            "Piece of Aerosiderite": 184,
            "Bit of Aerosiderite": 185,
            "Chunk of Aerosiderite": 186,
            "Coral Branch of a Distant Sea": 187,
            "Jeweled Branch of a Distant Sea": 188,
            "Jade Branch of a Distant Sea": 189,
            "Golden Branch of a Distant Sea": 190,
            "Narukami's Wisdom": 191,
            "Narukami's Joy": 192,
            "Narukami's Affection": 193,
            "Narukami's Valor": 194,
            "Mask of the Wicked Lieutenant": 195,
            "Mask of the Tiger's Bite": 196,
            "Mask of the One-Horned": 197,
            "Mask of the Kijin": 198
        };

        app.sortCharacters(characters);
        const totalRequirements = {};

        app.calculateRequiredResources = (name, stat, current, goal) => {
            if (!app.getCharacter(name)) return;

            let needs;

            if (stat === 'level') {
                if (name.startsWith('Traveler ')) name = "Traveler";
                const ascension = app.cloneByName(characterAscension, name);
                if (!ascension) return;

                needs = ascension.phases.filter((phase) => {
                    return phase.min_level >= current && phase.min_level < goal;
                });
            } else {
                const talentLevelUp = app.cloneByName(characterTalentLeventUp, name);
                if (!talentLevelUp) return;

                needs = talentLevelUp.levels.filter((level) => {
                    return level.min_level >= current && level.min_level < goal;
                });
            }

            return app.sumCountByName.apply(null, needs.map((need) => need.materials));
        };

        app.renderMaterials = ($container, materials) => {
            $container.empty()
            materials.sort((a, b) => {
                const aIdx = sortOrder[a.name] || 0;
                const bIdx = sortOrder[b.name] || 0;

                return aIdx - bIdx;
            });

            materials.forEach((mat) => {
                $container.append($(`<div class="d-inline-block"></div>`).append(app.makeCountCard(mat.name, mat.count)));
            });
        };

        // Update total requirements for all characters
        const $totalRequirements = $('.total-level-requirement-table');
        app.updateTotalRequirements = app.debounce(() => {
            const allTotalRequirements = app.sumCountByName.apply(null, Object.keys(totalRequirements).map((name) => totalRequirements[name]));
            app.renderMaterials($totalRequirements, allTotalRequirements);
        }, 500);

        const $characterSelectTable = $('#calculator-character-select-table');
        const $calculatorTable = $('#level-up-resource-calculator-table tbody');

        // Handle character selection
        $characterSelectTable.on('click keyup', '.card-container', function (evt) {
            if (evt.type === 'keyup' && !(evt.code === 'Space' || evt.code === 'Enter')) return;
            evt.preventDefault();

            const $this = $(this);
            const character = $this.data('resource') || {};
            if (character) {
                let selection = app.getByName(app.selections, character.name);
                if (!selection) {
                    selection = {
                        name: character.name,
                        selected: false,
                        currentLvl: 1,
                        currentAscended: false,
                        goalLvl: 90,
                        currentAscended: true,
                        constellation: 0,
                        talents: []
                    };
                    character.talents.forEach((talent) => {
                        if (['Normal Attack', 'Elemental Skill', 'Elemental Burst'].indexOf(talent.type) === -1) return;

                        selection.talents.push({
                            name: talent.name,
                            currentLvl: 1,
                            goalLvl: 10,
                            constellation: talent.constellation
                        });
                    });
                    app.selections.push(selection);

                    app.selections.sort(app.sortByName);
                }
                selection.selected = !selection.selected;
                app.localStorage.set('calculator-characters', app.selections);

                $this.toggleClass('selected', selection.selected);

                if (selection.selected) {
                    const nameId = selection.name.replace(' ', '-');
                    const $tr = $(`<tr data-resource-name="${character.name}" data-resource-rarity="${character.rarity}"></tr>`);

                    const $card = app.makeCharacterCard(character.name);
                    $tr.append($('<td></td>')
                        .append($card)
                        .append(`
<div class="form-group mx-auto" style="width: 74px;">
    <label style="font-size: .8em;">
        Constellation
    </label>
    <input class="character-constellation form-control form-control-sm" type="number" placeholder="Constellation" aria-label="Character constellation level" min="0" max="6" step="1" value="${selection.constellation}" data-current-value="0" />
</div>`));

                    $tr.append($(`<td style="padding: 0;">
                    <table class="calculate-level-table table table-bordered table-striped align-middle mb-0">
                      ${ character.name.startsWith('Traveler ') && character.name !== 'Traveler (Anemo)' ? '' : `<thead>
                        <tr>
                          <th scope="col" style="width: 90px">Level</th>
                          <th scope="col" style="width: 90px">Current</th>
                          <th scope="col" style="width: 90px">Goal</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                          </td>
                          <td>
                            <input class="current-level character-level form-control form-control-sm" type="number" placeholder="Current" aria-label="Current level" min="1" max="90" step="1" value="${selection.currentLvl}" />
                            <div class="form-check text-start ms-1">
                              <input class="form-check-input current-ascended" type="checkbox" id="current-ascended-${nameId}" ${selection.currentAscended ? "checked" : ""} />
                              <label class="form-check-label" for="current-ascended-${nameId}">
                                Ascended
                              </label>
                            </div>
                          </td>
                          <td>
                            <input class="goal-level character-level form-control form-control-sm" type="number" placeholder="Goal" aria-label="Character level goal" min="1" max="90" step="1" value="${selection.goalLvl}" />
                            <div class="form-check text-start ms-1">
                              <input class="form-check-input goal-ascended" type="checkbox" value="" id="goal-ascended-${nameId}" ${selection.goalAscended ? "checked" : ""} />
                              <label class="form-check-label" for="goal-ascended-${nameId}">
                                Ascended
                              </label>
                            </div>
                          </td>
                        </tr>`}
                        <tr>
                          <th scope="col">Talents</th>
                          <th scope="col">Current</th>
                          <th scope="col">Goal</th>
                        </tr>
                        ${selection.talents.map((talent) => {
                            var constellation = talent.constellation ? 'constellation-' + talent.constellation : '';
                        return `<tr>
                            <td>
                              <label>${talent.name}</label>
                            </td>
                            <td>
                              <input class="current-level talent-level form-control form-control-sm ${constellation}" type="number" placeholder="Current" aria-label="Current talent level" min="1" max="10" step="1" value="${talent.currentLvl}" />
                            </td>
                            <td>
                              <input class="goal-level talent-level form-control form-control-sm ${constellation}" type="number" placeholder="Goal" aria-label="Talent level goal" min="1" max="10" step="1" value="${talent.goalLvl}" />
                            </td>
                          </tr>`;
                    }).join('')}
                        </tr>
                      </tbody>
                    </table>
                  </td>`));

                    $tr.append('<td class="level-requirement-table"></td>');
                    $calculatorTable.append($tr);

                    $('tr[data-resource-name]', $calculatorTable).sort(function (a, b) {
                        var aname = $(a).attr('data-resource-name');
                        var bname = $(b).attr('data-resource-name');
                        return aname < bname ? -1 :
                            aname === bname ? 0 : 1;
                    }).sort((a, b) => {
                        var ararity = $(a).attr('data-resource-rarity');
                        var brarity = $(b).attr('data-resource-rarity');
                        return ararity < brarity ? 1 :
                            ararity === brarity ? 0 : -1;
                    }).prependTo($calculatorTable);

                    disableAscendedCheck($('.current-level.character-level', $tr));
                    disableAscendedCheck($('.goal-level.character-level', $tr));
                    $(':input', $tr).eq(0).change();
                } else {
                    $(`tr[data-resource-name="${selection.name}"]`, $calculatorTable).remove();
                    totalRequirements[selection.name] = null;
                    app.updateTotalRequirements();
                }
            }
        });

        // Handle all input changes
        $calculatorTable.on('change', 'input[type="number"]', function () {
            const $this = $(this);
            const val = +$this.val();
            const min = +$this.attr('min');
            const max = +$this.attr('max');
            if (val < min) $this.val(min);
            else if (val > max) $this.val(max);
        });

        // handle constellation change
        $calculatorTable.on('change', '.character-constellation', function () {
            const $this = $(this);
            const constellation = $this.val();
            const $card = $('.card-container', $this.closest('td'));
            const selection = app.getByName(app.selections, $card.attr('data-resource-name'));

            var previousConstellation = +$this.attr('data-current-value') || 0;
            selection.constellation = constellation >= 0 || constellation <= 6 ? constellation : 0;
            $this.attr('data-current-value', selection.constellation);

            var $lvlTable = $this.closest('tr').find('.calculate-level-table');

            $lvlTable.removeClass('constellation-0 constellation-1 constellation-2 constellation-3 constellation-4 constellation-5 constellation-6')
                .addClass('constellation-' + selection.constellation);

            let change = previousConstellation < 3 && selection.constellation >= 3 ? 3 :
                previousConstellation >= 3 && selection.constellation < 3 ? -3 : 0;

            if (change !== 0) {
                $('.constellation-3', $lvlTable).each(function () {
                    const $this = $(this).attr('min', change === 3 ? 4 : 1)
                        .attr('max', change === 3 ? 13 : 10);
                    $this.val(+$this.val() + change)
                });
            }

            change = previousConstellation < 5 && selection.constellation >= 5 ? 3 :
                previousConstellation >= 5 && selection.constellation < 5 ? -3 : 0;

            if (change !== 0) {
                $('.constellation-5', $lvlTable).each(function () {
                    const $this = $(this).attr('min', change === 3 ? 4 : 1)
                        .attr('max', change === 3 ? 13 : 10);
                    $this.val(+$this.val() + change)
                });
            }
            app.localStorage.set('calculator-characters', app.selections);
            $(':input', $lvlTable).eq(0).change()
        });

        const disableAscendedCheck = ($input) => {
            const lvl = +$input.val();

            $('.current-ascended, .goal-ascended', $input.next()).prop('disabled', lvl <= 0 || lvl >= 90 || lvl % 10 > 0);
        };
        // Handle character ascended disabled/enabled
        $calculatorTable.on('change', '.character-level', function () {
            disableAscendedCheck($(this));
        });

        // handle level change
        $calculatorTable.on('change', '.calculate-level-table :input', function () {
            const $tr = $(this).closest('.calculate-level-table').closest('tr');
            const selection = app.getByName(app.selections, $tr.attr('data-resource-name'));

            let requirements = [];

            $('.goal-level', $tr).each(function () {
                const $tr = $(this).closest('tr');
                const stat = $('td:first-child', $tr).text().trim() ? 'talent' : 'level';
                let current = +$('.current-level', $tr).val() || 0;
                let goal = +$('.goal-level', $tr).val() || 0;
                const currentAscended = $('.current-ascended', $tr).is(':checked');
                const goalAscended = $('.goal-ascended', $tr).is(':checked');

                if (stat === 'level') {
                    selection.currentLvl = +current || 0;
                    selection.currentAscended = !!currentAscended;
                    selection.goalLvl = +goal || 0;
                    selection.goalAscended = !!goalAscended;
                } else {
                    const talent = app.getByName(selection.talents, $('td:first-child', $tr).text().trim());
                    if (talent) {
                        if (selection.constellation >= talent.constellation) {
                            current -= 3;
                            goal -= 3;
                        }

                        talent.currentLvl = +current || 0;
                        talent.goalLvl = +goal || 0;
                    }
                }

                if (stat &&
                    current && !isNaN(+current) &&
                    goal && !isNaN(+goal) &&
                    +current <= +goal) {
                    const needs = app.calculateRequiredResources(selection.name, stat,
                        stat === 'level' && currentAscended ? +current + 0.5 : +current,
                        stat === 'level' && goalAscended ? +goal + 0.5 : +goal);

                    requirements.push(needs);
                }
            });

            requirements = app.sumCountByName.apply(null, requirements);

            app.renderMaterials($('.level-requirement-table', $tr), requirements);
            app.localStorage.set('calculator-characters', app.selections);

            // Update total requirements for all characters
            totalRequirements[selection.name] = requirements;
            app.updateTotalRequirements();
        });

        // Fill selection table with character cards
        const $characterSelectContainer = $('td', $characterSelectTable);

        characters.forEach((character) => {
            const $card = app.makeCharacterCard(character.name, true, true);

            if ($card) {
                const $wrapper = $('<div class="d-inline-block mx-1"></div>');
                $wrapper.append($card);
                $characterSelectContainer.append($wrapper);
            }
        });

        // Restore data
        app.selections = app.localStorage.get('calculator-characters');
        if (app.selections && Array.isArray(app.selections)) {
            app.selections.sort(app.sortByName);

            app.selections.forEach((selection) => {
                if (selection.name) {
                    if (selection.selected) {
                        selection.selected = false;
                        $(`[data-resource-name="${selection.name}"]`, $characterSelectContainer).click();
                    }
                }
            });
        } else {
            app.selections = [];
        }
    });