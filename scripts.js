(function () {
    const localStorage = {
        get: (key) => {
            try {
                return JSON.parse(window.localStorage.getItem(key));
            } catch (err) {}
        },
        set: (key, data) => {
            window.localStorage.setItem(key, JSON.stringify(data));
        }
    };

    var characters = localStorage.get('characters') || {
        data: []
    };
    var ascensions = localStorage.get('ascensions') || {
        data: []
    };
    var talents = localStorage.get('talents') || {
        data: []
    };

    characters.version = ascensions.version = talents.version = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, 0)}-${String(new Date().getDate()).padStart(2, 0)}`;
    // Get character data
    var character = (() => {
        const name = $('.portable-infobox [data-source="name"]').text().trim();

        var fn = (elementKey) => {
            elementKey = elementKey || '';

            const rarity = +$('.portable-infobox td[data-source="rarity"] img, .portable-infobox td[data-source="quality"] img').attr('title').replace('Stars', '').trim();
            const element = elementKey || $('.portable-infobox td[data-source="element"] a').text().trim();
            const weapon = $('.portable-infobox td[data-source="weapon"] a').text().trim();
            const region = name === 'Traveler' ? 'Outlander' : $('.portable-infobox [data-source="region"] .pi-data-value').text().trim();
            let constellation3 = '';
            let constellation5 = '';
            let $constellation = $(`#${elementKey}_Constellation, #Constellation`).eq(0).parent().next('table').find('tbody tr').not(':first');
            if (!$constellation.length) $constellation = $(`.constellation-table-container`).find('.constellation-table').find('> tbody > tr');

            const constellations = $constellation.map(function (idx)  {
                const $tr = $(this);
                const $td = $('td', $tr);

                if ($td.length === 4) {
                    const constellation = {
                        object_type: 'constellation',
                        name: $td.eq(2).text().trim(),
                        level: +$td.eq(0).text().trim(),
                        thumbnail: decodeURIComponent($('a img', $td.eq(1)).attr('data-image-key')),
                        link: decodeURIComponent($('a', $td.eq(1))[0].href)
                    };

                    if (constellation.level === 3) {
                        constellation3 = $td.eq(3).text().trim();
                    } else if (constellation.level === 5) {
                        constellation5 = $td.eq(3).text().trim();
                    }

                    return constellation;
                } else if ($td.length === 3) {
                    const constellation = {
                        object_type: 'constellation',
                        name: $td.eq(1).text().trim(),
                        level: +$td.eq(2).text().trim(),
                        thumbnail: decodeURIComponent($('a img', $td.eq(0)).attr('data-image-key')),
                        link: decodeURIComponent($('a', $td.eq(0))[0].href)
                    };

                    if (constellation.level === 3) {
                        constellation3 = $tr.next('tr').text().trim();
                    } else if (constellation.level === 5) {
                        constellation5 = $tr.next('tr').text().trim();
                    }

                    return constellation;
                }
            }).get();

            let $talents = $(`#${elementKey}_Talents, #Talents`).eq(0).parent().next('table').find('> tbody > tr');
            if (!$talents.length) $talents = $(`.talent-table-container`).find('.talent-table').find('> tbody > tr');

            return {
                object_type: 'character',
                name: elementKey ? `${name} (${element})` : name,
                type: 'Character',
                display_name: name,
                rarity: rarity,
                element: element,
                weapon: weapon,
                region: region,
                talents: $talents.map(function (idx) {
                    const $tr = $(this);
                    const $td = $('> td', $tr);

                    if ($td.length === 3) {
                        const talent = {
                            object_type: 'talent',
                            name: $td.eq(1).text().trim(),
                            type: $td.eq(2).text().trim(),
                            thumbnail: decodeURIComponent($('a img', $td.eq(0)).attr('data-image-key')),
                            link: decodeURIComponent($('a', $td.eq(0))[0].href)
                        };

                        if (talent.type === 'Elemental Skill' || talent.type === 'Elemental Burst') {
                            if (constellation3.indexOf(talent.name) !== -1) talent.constellation = 3;
                            else if (constellation5.indexOf(talent.name) !== -1) talent.constellation = 5;
                        }

                        return talent;
                    }
                }).get(),
                constellations: constellations,
                thumbnail: $(`.card_image a[title="${name}"] img`).attr('data-image-key') || ('Character_' + name.replaceAll(' ', '_') + '_Thumb.png'),
                link: decodeURIComponent(window.location.href)
            };
        };

        if (name === 'Traveler') {
            return [fn('Anemo'), fn('Dendro'), fn('Electro'), fn('Geo')];
        } else {
            return fn();
        }
    })();
    characters.data.push(character);

    // Get character ascension
    var ascension = (() => {
        const name = $('.portable-infobox [data-source="name"]').text().trim();

        return {
            object_type: 'character-ascension',
            name: name,
            phases: $('#Ascensions').eq(0).parent().next('table').find('tbody tr').map(function (idx) {
                const $tr = $(this);
                const $th = $('th', $tr);
                const $td = $('td', $tr);

                if (idx > 0) {
                    const lvl = idx;
                    const mora = +$td.eq(0).text().replace(',', '');
                    const materials = $td.map(function () {
                        const $this = $(this);
                        const count = +$('.card_font', $this).text().trim();
                        const name = $('.card_caption', $this).text().trim();

                        if (count && name) {
                            return {
                                name: name,
                                count: count
                            };
                        }
                    }).get();

                    materials.unshift({
                        name: 'Mora',
                        count: mora
                    });

                    const phase = {
                        object_type: 'ascension-phase',
                        level: lvl,
                        min_level: idx === 1 ? 20 : lvl * 10 + 20,
                        max_level: idx === 1 ? 40 : lvl * 10 + 30,
                        materials: materials
                    };

                    return phase;
                }
            }).get()
        };
    })();
    ascensions.data.push(ascension);
    // Get character talent ascension
    var talent = (() => {
        const name = $('.portable-infobox [data-source="name"]').text().trim();
        const $tr = $('table th:contains("Talent Leveling Materials")').closest('table').find('tr');
        var mat2 = $('td', $tr.eq(1)).eq(0).find('.card_caption').text();
        var mat3 = $('td', $tr.eq(1)).eq(1).find('.card_caption').text();
        var mat4 = $('td', $tr.eq(1)).eq(2).find('.card_caption').text();
        var com1 = $('td', $tr.eq(2)).eq(0).find('.card_caption').text();
        var com2 = $('td', $tr.eq(2)).eq(1).find('.card_caption').text();
        var com3 = $('td', $tr.eq(2)).eq(2).find('.card_caption').text();
        var boss = $('td', $tr.eq(3)).eq(0).find('.card_caption').text();

        const levels = [{
            level: 1,
            min_level: 1,
            max_level: 2,
            required_ascension_phase: 2,
            materials: [{
                name: 'Mora',
                count: 12500
            }, {
                name: mat2,
                count: 3
            }, {
                name: com1,
                count: 6
            }]
        }, {
            level: 2,
            min_level: 2,
            max_level: 3,
            required_ascension_phase: 3,
            materials: [{
                name: 'Mora',
                count: 17500
            }, {
                name: mat3,
                count: 2
            }, {
                name: com2,
                count: 3
            }]
        }, {
            level: 3,
            min_level: 3,
            max_level: 4,
            required_ascension_phase: 3,
            materials: [{
                name: 'Mora',
                count: 25000
            }, {
                name: mat3,
                count: 4
            }, {
                name: com2,
                count: 4
            }]
        }, {
            level: 4,
            min_level: 4,
            max_level: 5,
            required_ascension_phase: 4,
            materials: [{
                name: 'Mora',
                count: 30000
            }, {
                name: mat3,
                count: 6
            }, {
                name: com2,
                count: 6
            }]
        }, {
            level: 5,
            min_level: 5,
            max_level: 6,
            required_ascension_phase: 4,
            materials: [{
                name: 'Mora',
                count: 37500
            }, {
                name: mat3,
                count: 9
            }, {
                name: com2,
                count: 9
            }]
        }, {
            level: 6,
            min_level: 6,
            max_level: 7,
            required_ascension_phase: 5,
            materials: [{
                name: 'Mora',
                count: 120000
            }, {
                name: mat4,
                count: 4
            }, {
                name: com3,
                count: 4
            }, {
                name: boss,
                count: 1
            }]
        }, {
            level: 7,
            min_level: 7,
            max_level: 8,
            required_ascension_phase: 5,
            materials: [{
                name: 'Mora',
                count: 260000
            }, {
                name: mat4,
                count: 6
            }, {
                name: com3,
                count: 6
            }, {
                name: boss,
                count: 1
            }]
        }, {
            level: 8,
            min_level: 8,
            max_level: 9,
            required_ascension_phase: 6,
            materials: [{
                name: 'Mora',
                count: 450000
            }, {
                name: mat4,
                count: 12
            }, {
                name: com3,
                count: 9
            }, {
                name: boss,
                count: 2
            }]
        }, {
            level: 9,
            min_level: 9,
            max_level: 10,
            required_ascension_phase: 6,
            materials: [{
                name: 'Mora',
                count: 700000
            }, {
                name: mat4,
                count: 16
            }, {
                name: com3,
                count: 12
            }, {
                name: boss,
                count: 2
            }, {
                name: 'Crown of Insight',
                count: 1
            }]
        }];
        return {
            object_type: 'character-talent-level-up',
            name: name,
            levels: levels
        };
    })();
    talents.data.push(talent);

    localStorage.set('characters', characters);
    localStorage.set('ascensions', ascensions);
    localStorage.set('talents', talents);

    return {
        characters: characters,
        ascensions: ascensions,
        talents: talents
    };
})();

// Character Acension
(() => {
    const name = $('.portable-infobox [data-source="name"]').text().trim();

    var lvl = 1;
    return {
        object_type: 'character-ascension',
        name: name,
        phases: $($0).find('tbody tr').map(function (idx) {
            const $tr = $(this);
            const $th = $('th', $tr);
            const $cards = $('td .card_container', $tr);

            if ($cards.length) {
                const materials = $cards.map(function () {
                    const $this = $(this);
                    const count = +$('.card_font', $this).text().replace(/,/g, '').trim();
                    const name = $('a', $this).attr('title').trim();

                    if (count && name) {
                        return {
                            name: name,
                            count: count
                        };
                    }
                }).get();

                const phase = {
                    object_type: 'ascension-phase',
                    level: lvl,
                    min_level: lvl === 1 ? 20 : lvl * 10 + 20,
                    max_level: lvl === 1 ? 40 : lvl * 10 + 30,
                    materials: materials
                };
                lvl++;
                return phase;
            }
        }).get()
    };
})();

// Get character talent ascension
(() => {
    const name = $('.portable-infobox [data-source="name"]').text().trim();
    const $tr = $($0).find('tr');
    var mat2 = $('td', $tr.eq(1)).eq(4).find('a').attr('title');
    var mat3 = $('td', $tr.eq(2)).eq(4).find('a').attr('title');
    var mat4 = $('td', $tr.eq(6)).eq(4).find('a').attr('title');
    var com1 = $('td', $tr.eq(1)).eq(3).find('a').attr('title');
    var com2 = $('td', $tr.eq(2)).eq(3).find('a').attr('title');
    var com3 = $('td', $tr.eq(6)).eq(3).find('a').attr('title');
    var boss = $('td', $tr.eq(6)).eq(5).find('a').attr('title');

    const levels = [{
        level: 1,
        min_level: 1,
        max_level: 2,
        required_ascension_phase: 2,
        materials: [{
            name: 'Mora',
            count: 12500
        }, {
            name: mat2,
            count: 3
        }, {
            name: com1,
            count: 6
        }]
    }, {
        level: 2,
        min_level: 2,
        max_level: 3,
        required_ascension_phase: 3,
        materials: [{
            name: 'Mora',
            count: 17500
        }, {
            name: mat3,
            count: 2
        }, {
            name: com2,
            count: 3
        }]
    }, {
        level: 3,
        min_level: 3,
        max_level: 4,
        required_ascension_phase: 3,
        materials: [{
            name: 'Mora',
            count: 25000
        }, {
            name: mat3,
            count: 4
        }, {
            name: com2,
            count: 4
        }]
    }, {
        level: 4,
        min_level: 4,
        max_level: 5,
        required_ascension_phase: 4,
        materials: [{
            name: 'Mora',
            count: 30000
        }, {
            name: mat3,
            count: 6
        }, {
            name: com2,
            count: 6
        }]
    }, {
        level: 5,
        min_level: 5,
        max_level: 6,
        required_ascension_phase: 4,
        materials: [{
            name: 'Mora',
            count: 37500
        }, {
            name: mat3,
            count: 9
        }, {
            name: com2,
            count: 9
        }]
    }, {
        level: 6,
        min_level: 6,
        max_level: 7,
        required_ascension_phase: 5,
        materials: [{
            name: 'Mora',
            count: 120000
        }, {
            name: mat4,
            count: 4
        }, {
            name: com3,
            count: 4
        }, {
            name: boss,
            count: 1
        }]
    }, {
        level: 7,
        min_level: 7,
        max_level: 8,
        required_ascension_phase: 5,
        materials: [{
            name: 'Mora',
            count: 260000
        }, {
            name: mat4,
            count: 6
        }, {
            name: com3,
            count: 6
        }, {
            name: boss,
            count: 1
        }]
    }, {
        level: 8,
        min_level: 8,
        max_level: 9,
        required_ascension_phase: 6,
        materials: [{
            name: 'Mora',
            count: 450000
        }, {
            name: mat4,
            count: 12
        }, {
            name: com3,
            count: 9
        }, {
            name: boss,
            count: 2
        }]
    }, {
        level: 9,
        min_level: 9,
        max_level: 10,
        required_ascension_phase: 6,
        materials: [{
            name: 'Mora',
            count: 700000
        }, {
            name: mat4,
            count: 16
        }, {
            name: com3,
            count: 12
        }, {
            name: boss,
            count: 2
        }, {
            name: 'Crown of Insight',
            count: 1
        }]
    }];
    return {
        object_type: 'character-talent-level-up',
        name: name,
        levels: levels
    };
})();

// Get weapon
(function () {
    const weapons = {
        version: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, 0)}-${String(new Date().getDate()).padStart(2, 0)}`,
        data: ['Sword', 'Claymore', 'Polearm', 'Catalyst', 'Bow'].map((type) => {
            const $section = $(`[title="${type}s"]`).closest('tbody');

            return $('tr', $section).map(function () {
                const $tr = $(this);
                const $th = $('th', $tr);
                const $td = $('td', $tr);

                const rarity = +($('img', $th).attr('title') || '')[0];

                if (rarity) {
                    return $('a', $td).map(function () {
                        const $a = $(this);
                        const name = $a.attr('title');
                        const href = decodeURIComponent($a.attr('href'));

                        const imgSrc = decodeURIComponent($('img', $a).attr('src').split('/revision')[0]);
                        const imgName = imgSrc.split('/').pop();

                        return {
                            object_type: 'weapon',
                            name: name,
                            type: type,
                            rarity: rarity,
                            thumbnail: imgName,
                            image: imgSrc,
                            link: `https://genshin-impact.fandom.com${href}`
                        };
                    }).get();
                }
            }).get();
        }).flat()
    };

    weapons.data.sort((a, b) => a.name < b.name ? -1 : a.name === b.name ? 0 : 1);

    return weapons;
})();

// Get weapon ascension
(() => {
    const name = $('.portable-infobox [data-source="title"]').text().trim();

    return {
        object_type: 'weapon-ascension',
        name: name,
        phases: $('#Ascensions').eq(0).parent().next('table').find('tbody tr').map(function (idx) {
            const $tr = $(this);
            const $th = $('th', $tr);
            const $td = $('td', $tr);

            if (idx > 0) {
                const lvl = idx;
                const mora = +$td.eq(0).text().replace(',', '');
                const materials = $td.map(function () {
                    const $this = $(this);
                    const count = +$('.card_font', $this).text().trim();
                    const name = $('.card_caption', $this).text().trim();

                    if (count && name) {
                        return {
                            name: name,
                            count: count
                        };
                    }
                }).get();

                materials.unshift({
                    name: 'Mora',
                    count: mora
                });

                const phase = {
                    object_type: 'ascension-phase',
                    level: lvl,
                    min_level: idx === 1 ? 20 : lvl * 10 + 20,
                    max_level: idx === 1 ? 40 : lvl * 10 + 30,
                    materials: materials
                };

                return phase;
            }
        }).get()
    };
})();

// Get weapon ascension #2
(() => {
    const name = $('.portable-infobox [data-source="title"]').text().trim();

    let lvl = 1;
    return {
        object_type: 'weapon-ascension',
        name: name,
        phases: $('#Ascensions_and_Stats').eq(0).parent().next('table').find('tbody tr').map(function (idx) {
            const $tr = $(this);
            const $cardContainer = $('.mw-collapsible-content', $tr);

            if ($cardContainer.length) {
                var $cards = $('.card_container', $cardContainer);
                const materials = [{
                    name: 'Mora',
                    count: +$cards.eq(0).find('.card_font').text().trim().replace(',', '')
                }, {
                    name: $cards.eq(1).find('.card_image a').attr('title'),
                    count: +$cards.eq(1).find('.card_font').text().trim()
                }, {
                    name: $cards.eq(2).find('.card_image a').attr('title'),
                    count: +$cards.eq(2).find('.card_font').text().trim()
                }, {
                    name: $cards.eq(3).find('.card_image a').attr('title'),
                    count: +$cards.eq(3).find('.card_font').text().trim()
                }];

                const phase = {
                    object_type: 'ascension-phase',
                    level: lvl,
                    min_level: lvl === 1 ? 20 : lvl * 10 + 20,
                    max_level: lvl === 1 ? 40 : lvl * 10 + 30,
                    materials: materials
                };
                lvl++;
                return phase;
            }
        }).get()
    };
})();


// Get resources sort order for characters
app.data.resources.reduce((a, r, i) => {
    if (['Common Currency', 'Character EXP Material', 'Character Ascension Materials', 'Local Specialties',
            'Talent Level-Up Material', 'Common Ascension Materials'
        ].indexOf(r.type) !== -1) {
        a[r.name] = i;
    }
    return a;
}, {});


// Get resources sort order for weapons
app.data.resources.reduce((a, r, i) => {
    if (['Common Currency', 'Weapon Enhancement Materials', 'Common Ascension Materials', 'Weapon Ascension Materials'].indexOf(r.type) !== -1) {
        a[r.name] = i;
    }
    return a;
}, {});

// Get character code for tier-list
const chars = 'abcdefghjkmnpqrstuwxyz0123456789';
const dup = {};
var x = app.data.achievements.reduce((a, c, i) => {
    var name = c.name;
    var code = 0;
    for (var i = 0, ii = name.length; i < ii; i++) {
        code += name.charCodeAt(i) * (i + 1);
    }
    var xcode = code;
    let x = code & 31;
    let y = chars[x];
    for (var i = 1; i < 3; i++) {
        code >>= 5;
        x = code & 31;
        y += chars[x];
    }

    if (dup[y]) {
        console.log(name, y, xcode);
        console.log(dup[y]);
        y += dup[y];
    }

    dup[y] = (dup[y] || 0) + 1;
    a[name] = y;

    return a;
}, {});
x;

// Get Mondstadt local speciality
(() => {
    var resources = {
        version: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, 0)}-${String(new Date().getDate()).padStart(2, 0)}`,
        data: []
    };

    $('#Mondstadt, #Liyue, #Inazuma').each(function () {
        const $this = $(this);
        const region = $this.text();

        var data = $this.parent().nextAll('table').eq(0).find('tbody tr').map(function (idx) {
            const $tr = $(this);
            const $td = $('td', $tr);
            const name = $td.eq(1).text().trim();
            const nameId = name.replaceAll(' ', '_');

            return {
                object_type: 'item',
                name: name,
                type: 'Local Specialties',
                category: 'Materials',
                region: region,
                thumbnail: `Item_${nameId}.png`,
                link: 'https://genshin-impact.fandom.com/wiki/' + nameId
            };
        }).get();

        resources.data = resources.data.concat(data);
    });

    resources.data.sort((a, b) => {
        return a.name < b.name ? -1 :
            a.name > b.name ? 1 : 0;
    });

    return resources;
})();

// Get character experience table
(() => {
    const final = {
        version: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, 0)}-${String(new Date().getDate()).padStart(2, 0)}`,
        data: []
    };
    $('#EXP_Per_Level').parent().next().find('.wikitable').each(function () {
        const $table = $(this);

        $table.find('tr').each(function (idx) {
            if (idx > 0) {
                const $td = $(this).find('td');
                const data = {
                    level: +$td.eq(0).text(),
                    min_exp: +$td.eq(2).text().replaceAll(',', '') || 0,
                    to_next: +$td.eq(1).text().replaceAll(',', '') || 0
                }

                if (data.level === 90) {
                    data.to_next = 613950;
                }
                data.max_exp = data.min_exp + data.to_next - 1;
                final.data.push(data);
            }
        });
    });
    return final;
})();

// Get weapon experience table
(() => {
    const final = {
        version: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, 0)}-${String(new Date().getDate()).padStart(2, 0)}`,
        data: []
    };
    const data = {
        object_type: 'weapon-level',
        rarity: 1,
        levels: []
    };
    final.data.push(data);
    $('tr', $0).each(function () {
        const $tr = $(this);
        const $td = $('td', $tr);

        let lvl = +$td.eq(0).text();
        if (lvl) {
            let _lvl = {
                level: lvl,
                min_exp: +$td.eq(2).text().replaceAll(',', '') || 0,
                to_next: +$td.eq(1).text().replaceAll(',', '') || 0,
            };
            _lvl.max_exp = _lvl.min_exp + _lvl.to_next - 1;
            _lvl.mora_to_next = Math.ceil(_lvl.to_next / 10);
            data.levels.push(_lvl);
        }
        if ($td.length > 3) {
            let lvl = +$td.eq(3).text();
            if (lvl) {
                let _lvl = {
                    level: lvl,
                    min_exp: +$td.eq(5).text().replaceAll(',', '') || 0,
                    to_next: +$td.eq(4).text().replaceAll(',', '') || 0,
                };
                _lvl.max_exp = _lvl.min_exp + _lvl.to_next - 1;
                _lvl.mora_to_next = Math.ceil(_lvl.to_next / 10);
                data.levels.push(_lvl);
            }
        }
        if ($td.length > 6) {
            let lvl = +$td.eq(6).text();
            if (lvl) {
                let _lvl = {
                    level: lvl,
                    min_exp: +$td.eq(8).text().replaceAll(',', '') || 0,
                    to_next: +$td.eq(7).text().replaceAll(',', '') || 0,
                };
                _lvl.max_exp = _lvl.min_exp + _lvl.to_next - 1;
                _lvl.mora_to_next = Math.ceil(_lvl.to_next / 10);
                data.levels.push(_lvl);
            }
        }
    });
    data.levels.sort((a, b) => a.level - b.level);
    return final;
})();



app.makeTalentBookCard = (name) => {
    var book = app.getTalentBook(name);

    if (book) {
        var text = '';
        switch (book.domainLevel) {
            case 1:
                text = 'DL I+';
                break;
            case 2:
                text = 'DL II+';
                break;
            case 3:
                text = 'DL III+';
                break;
            case 4:
                text = 'DL IV+';
                break;
            case 5:
                text = 'DL V+';
                break;
            default:
                break;
        }
        var width = 0;
        switch (book.rarity) {
            case 1:
                width = 16;
                break;
            case 2:
                width = 27;
                break;
            case 3:
                width = 39;
                break;
            case 4:
                width = 50;
                break;
            case 5:
                width = 60;
                break;
            default:
                break;
        }

        return `<div class="card-with-caption">
<div class="card-container card-${book.rarity}">
    <img alt="${book.rarity} Star" src="./img/Rarity_${book.rarity}_background.png" width="74" height="90">
    <div class="card-image">
        <a href="${book.link}" target="_blank">
            <img alt="${book.name}" src="${book.thumbnail}" width="74" height="74" />
        </a>
        <div class="card-corner">
            <img alt="Card Corner.png" src="./img/card-Corner.png" width="14" height="14" />
        </div>
    </div>
    <div class="card-text">
        <span class="card-font">${text}</span>
    </div>
    <div class="card-stars star-${book.rarity}">
        <img alt="${book.rarity} Stars" src="./img/Icon_${book.rarity}_Stars.png" width="${width}" height="16">
    </div>
</div>
<div class="card-caption">
    <a href="${book.link}" target="_blank">${book.name}</a>
</div>
</div>`;
    }
};

// Download
((items) => {
    function saveData(blob, fileName) {
        var a = document.createElement('a');
        document.body.appendChild(a);
        a.style = 'display: none';

        var url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    }
    items = items.slice(0);

    var interval = setInterval(function () {
        var item = items.pop();

        console.log(item.name, item.image, item.thumbnail);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', item.image);
        xhr.responseType = 'blob';

        xhr.onload = function () {
            saveData(this.response, item.thumbnail); // saveAs is now your function

            if (items.length === 0) clearInterval(interval);
        };
        xhr.send();
    }, 500);
})(app.data.weapons);

(() => {
    let ascensions = app.data['character-ascension'];
    let resources = app.data.resources;
    let characters = app.data.characters;
    characters.sort(app.sortBy('name'));

    return characters.map((c) => {
        if (c.name.startsWith('Traveler')) {
            if (c.name === 'Traveler (Anemo)') c.name = 'Traveler';
            else return;
        }
        let ascension = ascensions.filter((a) => a.name === c.name)[0];

        let weapon = {
            object_type: 'ascension-materials',
            name: c.name,
            materials: []
        };
        if (ascension) {
            let materials = ascension.phases.map((p) => p.materials)
                .flat()
                .map((m) => m.name)
                .filter((m) => m !== 'Mora')
                .filter((m, i, s) => s.indexOf(m) === i);

            let final = materials.map((m) => {
                let resource = resources.filter((r) => r.name === m)[0];
                if (resource) return {
                    type: resource.type,
                    rarity: resource.rarity || 1,
                    name: resource.name
                };
            });

            final.sort(app.sortBy('rarity'));
            final.sort(app.sortBy('type'));
            weapon.materials = final;
        }

        return weapon;
    });
})();


// Hoyolab
// https://act.hoyolab.com/ys/event/calculator-sea/index.html#/

// Character Ascension
(() => {
    const ascension = {
        "object_type": "ascension-materials",
        "name": "",
        "materials": [{
            "type": "Boss Material",
            "rarity": 4,
            "name": ""
        }, {
            "type": "Character Ascension Materials",
            "rarity": 2,
            "name": ""
        }, {
            "type": "Character Ascension Materials",
            "rarity": 3,
            "name": ""
        }, {
            "type": "Character Ascension Materials",
            "rarity": 4,
            "name": ""
        }, {
            "type": "Character Ascension Materials",
            "rarity": 5,
            "name": ""
        }, {
            "type": "Common Ascension Materials",
            "rarity": 1,
            "name": ""
        }, {
            "type": "Common Ascension Materials",
            "rarity": 2,
            "name": ""
        }, {
            "type": "Common Ascension Materials",
            "rarity": 3,
            "name": ""
        }, {
            "type": "Local Specialties",
            "rarity": 1,
            "name": ""
        }]
    };

    const $avatarSection = document.querySelector('.avatar-section');
    if (!$avatarSection) throw new Error('Avatar section not found');
    const $name = $avatarSection.querySelector('.nickname');
    if (!$name) throw new Error('Name not found');
    ascension.name = $name.textContent.trim();

    const $calculation = document.querySelector('.single-computed-result');
    if (!$calculation) throw new Error('Calculator element not found');

    if (ascension.name === 'Traveler') {
        if ($('.ele', $calculation).classList.contains('ele-1')) {
            ascension.name += ' (Pyro)';
        } else if ($('.ele', $calculation).classList.contains('ele-2')) {
            ascension.name += ' (Anemo)';
        } else if ($('.ele', $calculation).classList.contains('ele-3')) {
            ascension.name += ' (Geo)';
        } else if ($('.ele', $calculation).classList.contains('ele-4')) {
            ascension.name += ' (Dendro)';
        } else if ($('.ele', $calculation).classList.contains('ele-5')) {
            ascension.name += ' (Electro)';
        } else if ($('.ele', $calculation).classList.contains('ele-6')) {
            ascension.name += ' (Hydro)';
        } else if ($('.ele', $calculation).classList.contains('ele-7')) {
            ascension.name += ' (Cryo)';
        }
    }

    const $tables = $calculation.querySelectorAll('.formation-details .table');
    if (!$tables) throw new Error('Tables not found');

    const mats = Array.from($tables).map($table => {
        const $header = $table.querySelector('.text-subtitle');

        return {
            name: $header.textContent.trim(),
            items: Array.from($table.querySelectorAll('.row-container .row')).map($row => $row.querySelector('.preview-name').textContent.trim())
        };
    }).filter(table => table?.name === 'Character Level')[0];

    ascension.materials[0].name = mats.items[7];
    ascension.materials[1].name = mats.items[0];
    ascension.materials[2].name = mats.items[1];
    ascension.materials[3].name = mats.items[2];
    ascension.materials[4].name = mats.items[3];
    ascension.materials[5].name = mats.items[4];
    ascension.materials[6].name = mats.items[5];
    ascension.materials[7].name = mats.items[6];
    ascension.materials[8].name = mats.items[8];
    
    return ascension;
})();

// Character Talent Level Up
(() => {
    const talent = {
        "object_type": "talent-level-up-materials",
        "name": "Venti",
        "materials": [{
            "type": "Common Ascension Materials",
            "rarity": 1,
            "name": "Slime Condensate"
        }, {
            "type": "Common Ascension Materials",
            "rarity": 2,
            "name": "Slime Secretions"
        }, {
            "type": "Common Ascension Materials",
            "rarity": 3,
            "name": "Slime Concentrate"
        }, {
            "type": "Elite Boss Material",
            "rarity": 5,
            "name": "Tail of Boreas"
        }, {
            "type": "Talent Level-Up Material",
            "rarity": 2,
            "name": "Teachings of Ballad"
        }, {
            "type": "Talent Level-Up Material",
            "rarity": 3,
            "name": "Guide to Ballad"
        }, {
            "type": "Talent Level-Up Material",
            "rarity": 4,
            "name": "Philosophies of Ballad"
        }]
    };

    const $avatarSection = document.querySelector('.avatar-section');
    if (!$avatarSection) throw new Error('Avatar section not found');
    const $name = $avatarSection.querySelector('.nickname');
    if (!$name) throw new Error('Name not found');
    talent.name = $name.textContent.trim();

    const $calculation = document.querySelector('.single-computed-result');
    if (!$calculation) throw new Error('Calculator element not found');

    if (talent.name === 'Traveler') {
        if ($('.ele', $calculation).classList.contains('ele-1')) {
            talent.name += ' (Pyro)';
        } else if ($('.ele', $calculation).classList.contains('ele-2')) {
            talent.name += ' (Anemo)';
        } else if ($('.ele', $calculation).classList.contains('ele-3')) {
            talent.name += ' (Geo)';
        } else if ($('.ele', $calculation).classList.contains('ele-4')) {
            talent.name += ' (Dendro)';
        } else if ($('.ele', $calculation).classList.contains('ele-5')) {
            talent.name += ' (Electro)';
        } else if ($('.ele', $calculation).classList.contains('ele-6')) {
            talent.name += ' (Hydro)';
        } else if ($('.ele', $calculation).classList.contains('ele-7')) {
            talent.name += ' (Cryo)';
        }
    }

    if (talent.name === 'Traveler') {
        if ($('.ele', $person).classList.contains('ele-1')) {
            talent.name += ' (Pyro)';
        } else if ($('.ele', $person).classList.contains('ele-2')) {
            talent.name += ' (Anemo)';
        } else if ($('.ele', $person).classList.contains('ele-3')) {
            talent.name += ' (Geo)';
        } else if ($('.ele', $person).classList.contains('ele-4')) {
            talent.name += ' (Dendro)';
        } else if ($('.ele', $person).classList.contains('ele-5')) {
            talent.name += ' (Electro)';
        } else if ($('.ele', $person).classList.contains('ele-6')) {
            talent.name += ' (Hydro)';
        } else if ($('.ele', $person).classList.contains('ele-7')) {
            talent.name += ' (Cryo)';
        }

        delete talent.materials;
        talent.levels = [{
                "level": 1,
                "min_level": 1,
                "max_level": 2,
                "required_ascension_phase": 2,
                "materials": [{
                    "name": "Mora",
                    "count": 12500
                }, {
                    "name": "",
                    "count": 3
                }, {
                    "name": "",
                    "count": 6
                }]
            }, {
                "level": 2,
                "min_level": 2,
                "max_level": 3,
                "required_ascension_phase": 3,
                "materials": [{
                    "name": "Mora",
                    "count": 17500
                }, {
                    "name": "",
                    "count": 2
                }, {
                    "name": "",
                    "count": 3
                }]
            }, {
                "level": 3,
                "min_level": 3,
                "max_level": 4,
                "required_ascension_phase": 3,
                "materials": [{
                    "name": "Mora",
                    "count": 25000
                }, {
                    "name": "",
                    "count": 4
                }, {
                    "name": "",
                    "count": 4
                }]
            }, {
                "level": 4,
                "min_level": 4,
                "max_level": 5,
                "required_ascension_phase": 4,
                "materials": [{
                    "name": "Mora",
                    "count": 30000
                }, {
                    "name": "",
                    "count": 6
                }, {
                    "name": "",
                    "count": 6
                }]
            }, {
                "level": 5,
                "min_level": 5,
                "max_level": 6,
                "required_ascension_phase": 4,
                "materials": [{
                    "name": "Mora",
                    "count": 37500
                }, {
                    "name": "",
                    "count": 9
                }, {
                    "name": "",
                    "count": 9
                }]
            }, {
                "level": 6,
                "min_level": 6,
                "max_level": 7,
                "required_ascension_phase": 5,
                "materials": [{
                    "name": "Mora",
                    "count": 120000
                }, {
                    "name": "",
                    "count": 4
                }, {
                    "name": "",
                    "count": 4
                }, {
                    "name": "",
                    "count": 1
                }]
            }, {
                "level": 7,
                "min_level": 7,
                "max_level": 8,
                "required_ascension_phase": 5,
                "materials": [{
                    "name": "Mora",
                    "count": 260000
                }, {
                    "name": "",
                    "count": 6
                }, {
                    "name": "",
                    "count": 6
                }, {
                    "name": "",
                    "count": 1
                }]
            }, {
                "level": 8,
                "min_level": 8,
                "max_level": 9,
                "required_ascension_phase": 6,
                "materials": [{
                    "name": "Mora",
                    "count": 450000
                }, {
                    "name": "",
                    "count": 12
                }, {
                    "name": "",
                    "count": 9
                }, {
                    "name": "",
                    "count": 2
                }]
            }, {
                "level": 9,
                "min_level": 9,
                "max_level": 10,
                "required_ascension_phase": 6,
                "materials": [{
                    "name": "Mora",
                    "count": 700000
                }, {
                    "name": "",
                    "count": 16
                }, {
                    "name": "",
                    "count": 12
                }, {
                    "name": "",
                    "count": 2
                }, {
                    "name": "Crown of Insight",
                    "count": 1
                }]
            }];

        return talent;
    }

    const $tables = $calculation.querySelectorAll('.formation-details .table');
    if (!$tables) throw new Error('Tables not found');

    const mats = Array.from($tables).map($table => {
        const $header = $table.querySelector('.text-subtitle');

        return {
            name: $header.textContent.trim(),
            items: Array.from($table.querySelectorAll('.row-container .row')).map($row => $row.querySelector('.preview-name').textContent.trim())
        };
    }).filter(table => table?.name !== 'Character Level')[0];

    talent.materials[0].name = mats.items[3];
    talent.materials[1].name = mats.items[4];
    talent.materials[2].name = mats.items[5];
    talent.materials[3].name = mats.items[6];
    talent.materials[4].name = mats.items[0];
    talent.materials[5].name = mats.items[1];
    talent.materials[6].name = mats.items[2];
    
    return talent;
})();

// Weapon ascension

(function() {
    const $calculation = document.querySelector('.gt-popup-layout__main');
    if (!$calculation) throw new Error('Calculator element not found');
    const $name = $calculation.querySelector('.weapon-card .weapon-name');
    if (!$name) throw new Error('Name not found');

    
    const $tables = $calculation.querySelectorAll('.formation-details .table');
    if (!$tables) throw new Error('Tables not found');

    const mats = Array.from($tables).map($table => {
        const $header = $table.querySelector('.text-subtitle');

        return {
            name: $header.textContent.trim(),
            items: Array.from($table.querySelectorAll('.row-container .row')).map($row => $row.querySelector('.preview-name').textContent.trim())
        };
    })[0];

const itemCount = mats.items.length;
    var metadata = {
        "object_type": "ascension-materials",
        "name": $name.textContent.trim(),
        "materials": []
    };
    // 1-2 stars have 9 items. 3-5 stars have 12 items
    // items include Mora and enhancement crystals
    var map = [{
        "type": "Common Ascension Materials",
        "rarity": 1,
        "index": 0
    }, {
        "type": "Common Ascension Materials",
        "rarity": 2,
        "index": 1
    }, {
        "type": "Common Ascension Materials",
        "rarity": 3,
        "index": itemCount > 9 ? 2 : -1
    }, {
        "type": "Elite Common Ascension Materials",
        "rarity": 2,
        "index": itemCount > 9 ? 3 : 2
    }, {
        "type": "Elite Common Ascension Materials",
        "rarity": 3,
        "index": itemCount > 9 ? 4 : 3
    }, {
        "type": "Elite Common Ascension Materials",
        "rarity": 4,
        "index": itemCount > 9 ? 5 : -1
    }, {
        "type": "Weapon Ascension Materials",
        "rarity": 2,
        "index": itemCount > 9 ? 6 : 4
    }, {
        "type": "Weapon Ascension Materials",
        "rarity": 3,
        "index": itemCount > 9 ? 7 : 5
    }, {
        "type": "Weapon Ascension Materials",
        "rarity": 4,
        "index": itemCount > 9 ? 8 : 6
    }, {
        "type": "Weapon Ascension Materials",
        "rarity": 5,
        "index": itemCount > 9 ? 9 : -1
    }];

    map.forEach(function(m, idx) {
        if (m.index !== -1) {
            metadata.materials.push({
                "type": m.type,
                "rarity": m.rarity,
                "name": mats.items[m.index]
            })
        }
    });

    return metadata;
})();

