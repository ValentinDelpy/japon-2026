// =============================================
// DESTINATIONS DATABASE — Japan Travel Guides
// Rich content for each major destination
// =============================================

const DESTINATIONS_DB = {
  // ---- TOKYO ----
  "tokyo": {
    name: "Tokyo",
    nameJP: "東京",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    intro: "Mégalopole où tradition ancestrale et futurisme se côtoient dans un ballet permanent. Tokyo, c'est le vertige des sens : temples millénaires nichés entre des gratte-ciels, izakayas enfumés sous des néons clignotants, et le silence méditatif d'un jardin zen à deux pas du carrefour le plus traversé du monde.",
    highlights: [
      "Traverser le mythique carrefour de Shibuya au milieu de 3 000 piétons",
      "Se perdre dans les ruelles de Golden Gai à Shinjuku (200 bars minuscules)",
      "Visiter le temple Senso-ji à Asakusa dès l'aube pour éviter la foule",
      "Explorer le marché extérieur de Tsukiji pour des sushis frais dès 6h du matin",
      "Admirer la vue depuis le Tokyo Skytree ou la Tokyo Tower au coucher du soleil",
      "Flâner dans le quartier d'Akihabara, paradis de l'électronique et des mangas"
    ],
    funFacts: [
      "Tokyo possède plus d'étoiles Michelin que n'importe quelle autre ville au monde (plus de 200 restaurants étoilés).",
      "Le système de métro de Tokyo transporte 8,7 millions de passagers par jour, avec un retard moyen de seulement 18 secondes par an.",
      "Il existe des cafés où vous pouvez caresser des hérissons, des hiboux, des chèvres, et même des serpents."
    ],
    restaurants: [
      { name: "Ichiran Ramen", type: "Ramen", desc: "Ramen tonkotsu dans des box individuels. Une expérience unique et des nouilles parfaites.", price: "¥1,000" },
      { name: "Tsukiji Sushidai", type: "Sushi", desc: "Omakase de poissons ultra-frais directement du marché. File d'attente légendaire mais ça vaut chaque minute.", price: "¥4,000" },
      { name: "Gonpachi (Roppongi)", type: "Izakaya", desc: "Le restaurant qui a inspiré le décor de Kill Bill. Ambiance théâtrale, yakitori et soba excellents.", price: "¥3,500" },
      { name: "Afuri", type: "Ramen", desc: "Ramen yuzu shio léger et rafraîchissant, alternative parfaite aux bouillons lourds.", price: "¥1,200" }
    ],
    tips: "Procurez-vous une carte Suica/Pasmo dès votre arrivée pour les transports. Les konbini (7-Eleven, Lawson, FamilyMart) sont vos meilleurs amis pour manger bien et pas cher."
  },

  // ---- KYOTO ----
  "kyoto": {
    name: "Kyoto",
    nameJP: "京都",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
    intro: "Ancienne capitale impériale, Kyoto est le cœur spirituel du Japon. Avec ses 2 000 temples et sanctuaires, ses geishas qui traversent furtivement les ruelles de Gion, et ses jardins zen d'une perfection surnaturelle, la ville est un portail vers le Japon éternel.",
    highlights: [
      "Traverser les 10 000 torii vermillon du Fushimi Inari Taisha au lever du soleil",
      "Méditer devant le jardin de pierres du Ryoan-ji",
      "Se promener dans la forêt de bambous d'Arashiyama",
      "Apercevoir des geiko et maiko dans le quartier de Gion au crépuscule",
      "Visiter le Pavillon d'Or (Kinkaku-ji) qui se reflète dans son lac-miroir",
      "Participer à une cérémonie du thé traditionnelle"
    ],
    funFacts: [
      "Kyoto a été retirée de la liste des cibles de la bombe atomique américaine en 1945 grâce à l'intervention du secrétaire à la Guerre Henry Stimson, qui y avait passé sa lune de miel.",
      "Les rues de Kyoto forment un quadrillage parfait inspiré de l'ancienne capitale chinoise Chang'an.",
      "Il y a plus de 1 600 temples bouddhistes et 400 sanctuaires shinto dans la ville."
    ],
    restaurants: [
      { name: "Nishiki Market", type: "Marché", desc: "Le « garde-manger de Kyoto » : 400m de stands proposant pickles, mochi, dashimaki tamago et spécialités locales.", price: "¥500-2,000" },
      { name: "Gion Kappa", type: "Kaiseki", desc: "Cuisine kaiseki abordable dans le quartier des geishas. Présentation artistique, saveurs subtiles.", price: "¥5,000" },
      { name: "Menbakaichidai", type: "Ramen", desc: "Le fire ramen : le chef enflamme littéralement votre bol devant vous. Spectacle et saveur.", price: "¥900" },
      { name: "Musubi Café", type: "Végétarien", desc: "Cuisine shojin-ryori (bouddhiste végétarienne) dans un cadre zen et épuré.", price: "¥1,500" }
    ],
    tips: "Louez un vélo ! Kyoto est assez plate et se explore merveilleusement à bicyclette. Évitez les temples les plus populaires en milieu de journée."
  },

  // ---- OSAKA ----
  "osaka": {
    name: "Osaka",
    nameJP: "大阪",
    image: "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&q=80",
    intro: "Si Tokyo est la tête du Japon, Osaka est son estomac et son cœur. Capitale de la street-food japonaise, ville bruyante, joyeuse et décomplexée, Osaka est l'antithèse de la retenue nippone. Ici, on mange jusqu'à en tomber — c'est même le crédo local : kuidaore (食い倒れ), « se ruiner en mangeant ».",
    highlights: [
      "Dévorer des takoyaki (boulettes de poulpe) dans le quartier de Dotonbori",
      "Photographier les enseignes géantes luminescentes le long du canal",
      "Visiter le château d'Osaka et ses jardins, surtout pendant les cerisiers en fleurs",
      "Explorer le quartier populaire de Shinsekai et sa tour Tsutenkaku rétro",
      "Faire le plein de street-food à Kuromon Market, le « kitchen of Osaka »",
      "S'amuser à Universal Studios Japan"
    ],
    funFacts: [
      "Les Osakiens se tiennent à gauche sur les escalators (contrairement au reste du Japon qui se tient à droite). Personne ne sait vraiment pourquoi.",
      "Osaka est la ville natale du cup noodle — vous pouvez visiter le musée du Cup Noodle et créer votre propre saveur personnalisée.",
      "La ville possède plus de restaurants par habitant que n'importe quelle autre ville japonaise."
    ],
    restaurants: [
      { name: "Takoyaki Wanaka", type: "Takoyaki", desc: "Les meilleures boulettes de poulpe d'Osaka : croustillantes dehors, fondantes dedans.", price: "¥600" },
      { name: "Mizuno", type: "Okonomiyaki", desc: "Okonomiyaki classique d'Osaka, préparé devant vous sur la plaque chauffante.", price: "¥1,200" },
      { name: "Daruma Kushikatsu", type: "Kushikatsu", desc: "Brochettes panées et frites. Règle absolue : on ne trempe qu'UNE FOIS dans la sauce commune.", price: "¥800" },
      { name: "Rikuro Ojisan", type: "Pâtisserie", desc: "Cheesecake japonais soufflé et jiggly. La file d'attente est un spectacle en soi.", price: "¥800" }
    ],
    tips: "Dotonbori est magique la nuit avec ses néons. Pour l'okonomiyaki, essayez le style « Osaka » (mixé) plutôt que le style « Hiroshima » (en couches)."
  },

  // ---- HIROSHIMA ----
  "hiroshima": {
    name: "Hiroshima",
    nameJP: "広島",
    image: "https://images.unsplash.com/photo-1576623684013-f3c8e09c7445?w=800&q=80",
    intro: "Hiroshima est une leçon d'humanité. La ville, rasée le 6 août 1945, a renaît de ses cendres pour devenir un symbole mondial de paix. Aujourd'hui, c'est une cité vibrante et accueillante, connue pour ses okonomiyaki uniques et sa proximité avec la sublime île de Miyajima.",
    highlights: [
      "Se recueillir au Mémorial de la Paix et au Dôme de la Bombe A",
      "Plier une grue en origami au monument des enfants de la paix",
      "Prendre le ferry pour Miyajima et son torii flottant emblématique",
      "Déguster un okonomiyaki style Hiroshima (en couches, pas mélangé !)",
      "Se promener dans le jardin Shukkeien, miniature de paysages japonais",
      "Visiter le château d'Hiroshima, reconstruit fidèlement"
    ],
    funFacts: [
      "Les tramways de Hiroshima incluent des rames qui ont survécu à la bombe atomique et circulent encore aujourd'hui.",
      "L'okonomiyaki de Hiroshima est radicalement différent de celui d'Osaka : les ingrédients sont empilés en couches plutôt que mélangés.",
      "L'île de Miyajima est considérée si sacrée que pendant des siècles, aucune naissance ni aucun décès n'y était autorisé."
    ],
    restaurants: [
      { name: "Nagataya", type: "Okonomiyaki", desc: "Institution locale depuis 1950. Le okonomiyaki Hiroshima-style y est parfait : nouilles croustillantes, chou fondant.", price: "¥1,000" },
      { name: "Hassei", type: "Tsukemen", desc: "Tsukemen (ramen trempé) aux saveurs intenses. Les locaux font la queue.", price: "¥950" },
      { name: "Kakiya (Miyajima)", type: "Huîtres", desc: "Huîtres de Miyajima grillées, frites ou crues. Le terroir marin à son meilleur.", price: "¥1,500" },
      { name: "Okonomi-mura", type: "Okonomiyaki", desc: "Un bâtiment entier de 3 étages dédié à l'okonomiyaki. 25 stands au choix.", price: "¥900" }
    ],
    tips: "Prenez le JR Pass pour le ferry vers Miyajima (gratuit avec le pass). Arrivez tôt le matin pour voir le torii à marée basse — on peut marcher jusqu'à lui."
  },

  // ---- NARA ----
  "nara": {
    name: "Nara",
    nameJP: "奈良",
    image: "https://images.unsplash.com/photo-1624601573012-efb68f3f150d?w=800&q=80",
    intro: "Nara, première capitale permanente du Japon (710-784), est une ville à taille humaine où plus de 1 000 cerfs sacrés se promènent librement dans les parcs et les rues. C'est un lieu enchanteur, plus intime que Kyoto, avec des trésors architecturaux parmi les plus anciens du pays.",
    highlights: [
      "Nourrir les cerfs sika qui s'inclinent poliment pour recevoir des crackers",
      "S'émerveiller devant le Daibutsu (Grand Bouddha) du Todai-ji, le plus grand bâtiment en bois du monde",
      "Flâner dans le parc de Nara, surtout au printemps (cerisiers) ou à l'automne (érables)",
      "Explorer le sanctuaire Kasuga Taisha et ses 3 000 lanternes",
      "Découvrir le quartier de Naramachi et ses maisons de marchands traditionnelles"
    ],
    funFacts: [
      "Les cerfs de Nara sont officiellement classés comme « trésors nationaux ». Jusqu'en 1637, tuer un cerf de Nara était passible de la peine de mort.",
      "Le Grand Bouddha du Todai-ji mesure 15 mètres de haut et pèse 500 tonnes de bronze.",
      "Un pilier du Todai-ji possède un trou de la taille de la narine du Bouddha. S'y faufiler garantirait l'illumination."
    ],
    restaurants: [
      { name: "Kakinoha Sushi Tanaka", type: "Sushi", desc: "Spécialité de Nara : sushi pressé enveloppé dans des feuilles de kaki.", price: "¥1,200" },
      { name: "Mellow Café", type: "Café", desc: "Café cozy avec vue sur le parc aux cerfs. Parfait pour une pause matcha latte.", price: "¥600" },
      { name: "Edogawa", type: "Unagi", desc: "Anguille grillée (unagi) servie sur un lit de riz, une spécialité à ne pas manquer.", price: "¥2,500" }
    ],
    tips: "Nara se visite facilement comme excursion d'une journée depuis Kyoto ou Osaka (45 min en train). Attention : les cerfs peuvent mordre si vous agitez un cracker devant eux sans le leur donner !"
  },

  // ---- HAKONE ----
  "hakone": {
    name: "Hakone",
    nameJP: "箱根",
    image: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
    intro: "Station thermale nichée dans les montagnes à 1h30 de Tokyo, Hakone offre des panoramas spectaculaires sur le Mont Fuji, des sources chaudes fumantes, et un parcours touristique varié entre lac, volcan et musées. C'est l'escapade nature parfaite depuis la capitale.",
    highlights: [
      "Admirer le Mont Fuji se refléter dans le lac Ashi (par temps clair !)",
      "Naviguer sur le lac Ashi à bord d'un « bateau pirate »",
      "Prendre le téléphérique au-dessus de la vallée volcanique d'Owakudani",
      "Goûter les œufs noirs d'Owakudani (ils ajoutent supposément 7 ans à votre vie)",
      "Se relaxer dans un onsen avec vue sur les montagnes",
      "Visiter le Hakone Open-Air Museum et ses sculptures en pleine nature"
    ],
    funFacts: [
      "Les œufs noirs d'Owakudani doivent leur couleur au soufre volcanique. Chaque œuf est censé ajouter 7 ans à votre vie.",
      "Le Hakone Tozan Railway est le plus ancien train de montagne du Japon, avec des zigzags (switchbacks) spectaculaires.",
      "Le lac Ashi est en fait la caldeira d'un ancien volcan qui a explosé il y a 3 000 ans."
    ],
    restaurants: [
      { name: "Amazake-chaya", type: "Traditionnel", desc: "Maison de thé de 400 ans sur l'ancienne route du Tokaido. Amazake (boisson sucrée au riz) et mochi grillé.", price: "¥500" },
      { name: "Gyoza Center", type: "Gyoza", desc: "Gyoza croustillants et juteux dans un cadre décontracté. Simple mais délicieux.", price: "¥700" },
      { name: "Bella Foresta (Open-Air Museum)", type: "Buffet", desc: "Buffet avec vue sur les sculptures. Bonne cuisine variée dans un cadre unique.", price: "¥2,200" }
    ],
    tips: "Le Hakone Free Pass est indispensable : il couvre tous les transports de la zone (train, bus, bateau, téléphérique). Le Mont Fuji n'est visible que par temps clair — visez le matin tôt."
  },

  // ---- NIKKO ----
  "nikko": {
    name: "Nikko",
    nameJP: "日光",
    image: "https://images.unsplash.com/photo-1578469645742-46cae010e5d6?w=800&q=80",
    intro: "Nikko est un joyau caché dans les montagnes au nord de Tokyo. Ses sanctuaires et temples, classés au patrimoine mondial de l'UNESCO, sont d'une splendeur baroque inouïe — un contraste saisissant avec la sobriété zen habituelle du Japon. Ajoutez-y des cascades, des lacs turquoise et des forêts de cèdres centenaires.",
    highlights: [
      "Admirer l'exubérance du Tosho-gu, le mausolée du shogun Tokugawa Ieyasu",
      "Trouver les trois singes de la sagesse (ne rien voir, dire, entendre) sur la façade du sanctuaire",
      "Contempler la cascade de Kegon (97m de chute libre) depuis l'observatoire",
      "Se promener autour du lac Chuzenji en automne pour les couleurs spectaculaires",
      "Marcher sur le pont sacré Shinkyo, l'un des plus beaux du Japon"
    ],
    funFacts: [
      "Le Tosho-gu contient une sculpture de chat endormi (Nemuri-neko) si réaliste qu'on dit que les oiseaux sculptés de l'autre côté ne craignent pas d'être mangés car le chat dort.",
      "Un proverbe japonais dit « Ne dites pas kekko (magnifique) avant d'avoir vu Nikko ».",
      "Les allées de cèdres menant à Nikko s'étendent sur 35 km — la plus longue avenue bordée d'arbres du monde."
    ],
    restaurants: [
      { name: "Hippari Dako", type: "Traditionnel", desc: "Yuba (peau de tofu) sous toutes ses formes, spécialité de Nikko depuis des siècles.", price: "¥1,200" },
      { name: "Nikko Coffee", type: "Café", desc: "Café artisanal dans une maison traditionnelle rénovée. L'endroit parfait pour souffler.", price: "¥500" }
    ],
    tips: "Le Nikko Pass est rentable si vous visitez le lac Chuzenji. En automne (mi-octobre à mi-novembre), les couleurs sont absolument époustouflantes."
  },

  // ---- KAMAKURA ----
  "kamakura": {
    name: "Kamakura",
    nameJP: "鎌倉",
    image: "https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?w=800&q=80",
    intro: "Ancienne capitale des shoguns, Kamakura est une ville balnéaire mystique à 1h de Tokyo. Son Grand Bouddha de bronze trône en plein air depuis 500 ans, tandis que des dizaines de temples se cachent dans les collines boisées. L'été, ses plages attirent surfeurs et baigneurs.",
    highlights: [
      "Se recueillir devant le Grand Bouddha (Daibutsu) de 13m de haut",
      "Randonner le sentier de Daibutsu entre temples et forêts",
      "Visiter le temple Hase-dera et ses milliers de petites statues Jizo",
      "Explorer le sanctuaire Tsurugaoka Hachimangu et sa longue allée",
      "Surfer ou se promener sur la plage de Yuigahama"
    ],
    funFacts: [
      "Le Grand Bouddha de Kamakura se trouvait autrefois à l'intérieur d'un bâtiment, mais un tsunami l'a emporté en 1498. Le Bouddha, lui, n'a pas bougé.",
      "Kamakura possède sa propre variante de chemise hawaïenne : le « Kamakura shirt », devenu culte chez les amateurs de mode."
    ],
    restaurants: [
      { name: "Bowls Kamakura", type: "Shirasu-don", desc: "Bol de riz garni de petits poissons blancs (shirasu) pêchés le jour même.", price: "¥1,300" },
      { name: "Komachi-dori Street Food", type: "Street food", desc: "La rue commerçante regorge de snacks : warabi mochi, crêpes japonaises, croquettes.", price: "¥300-800" }
    ],
    tips: "Combinable en une journée avec Enoshima (l'île au bout du train Enoden). Le train Enoden longe la mer — un des plus beaux trajets en train du Japon."
  },

  // ---- KANAZAWA ----
  "kanazawa": {
    name: "Kanazawa",
    nameJP: "金沢",
    image: "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&q=80",
    intro: "Kanazawa est le secret le mieux gardé du Japon. Épargnée par les bombardements de la Seconde Guerre mondiale, la ville a conservé ses quartiers de samouraïs et de geishas intacts. Son jardin Kenroku-en est considéré comme l'un des trois plus beaux jardins du Japon.",
    highlights: [
      "Déambuler dans le Kenroku-en, jardin parfait en toute saison",
      "Explorer le quartier des samouraïs Nagamachi et ses murs en terre",
      "Visiter le musée d'art contemporain du 21e siècle (gratuit en partie)",
      "S'émerveiller au marché Omi-cho, le « ventre de Kanazawa »",
      "Découvrir les quartiers de geishas Higashi Chaya et Kazue-machi"
    ],
    funFacts: [
      "Kanazawa signifie littéralement « marais d'or ». La ville produit 99% de tout l'or en feuille du Japon.",
      "Vous pouvez manger une glace recouverte de feuille d'or à Kanazawa — l'expérience ultime de luxe comestible.",
      "Le Kenroku-en change radicalement d'apparence avec chaque saison, ce qui lui vaut le nom de « jardin des six attributs sublimes »."
    ],
    restaurants: [
      { name: "Omi-cho Market", type: "Marché", desc: "Fruits de mer de la mer du Japon : crabe des neiges, uni (oursin), buri (sériole). Fraîcheur incomparable.", price: "¥1,500-3,000" },
      { name: "Kinjohro", type: "Kaiseki", desc: "Cuisine kaiseki raffinée de Kaga dans un ryokan historique. Réservation obligatoire.", price: "¥8,000" },
      { name: "Hakuichi Gold Leaf Soft Cream", type: "Dessert", desc: "Glace à la vanille recouverte d'une feuille d'or entière. Le selfie obligatoire de Kanazawa.", price: "¥900" }
    ],
    tips: "Le bus circulaire Kanazawa Loop dessert tous les sites majeurs. La ville est particulièrement belle en hiver avec la neige sur le Kenroku-en."
  },

  // ---- TAKAYAMA ----
  "takayama": {
    name: "Takayama",
    nameJP: "高山",
    image: "https://images.unsplash.com/photo-1580533089532-54e9b8f62997?w=800&q=80",
    intro: "Perchée dans les Alpes japonaises, Takayama est une petite ville de montagne qui a préservé son atmosphère d'époque Edo. Ses ruelles de maisons en bois sombre, ses brasseries de saké et son marché du matin offrent un aperçu rare du Japon rural traditionnel.",
    highlights: [
      "Se promener dans Sanmachi Suji, les ruelles préservées de l'ère Edo",
      "Goûter le bœuf de Hida, aussi fondant que le Wagyu de Kobe",
      "Visiter les marchés du matin (Jinya-mae et Miyagawa)",
      "Explorer le village folklorique de Hida no Sato (maisons au toit de chaume)",
      "Déguster le saké local dans les brasseries traditionnelles"
    ],
    funFacts: [
      "Les charpentiers de Hida (la région de Takayama) étaient si réputés que le gouvernement impérial les exemptait d'impôts en échange de leurs services de construction.",
      "Le festival de Takayama est l'un des trois plus beaux festivals du Japon, avec des chars d'une complexité mécanique stupéfiante.",
      "Le bœuf de Hida est une variété de Wagyu qui rivalise avec le célèbre bœuf de Kobe."
    ],
    restaurants: [
      { name: "Center4 Hamburgers", type: "Burger Hida Beef", desc: "Burger artisanal au bœuf de Hida. Oui, un burger au Japon peut être transcendant.", price: "¥1,200" },
      { name: "Kyoya", type: "Soba", desc: "Soba faites maison dans un bâtiment historique. Le dipping soba est exceptionnel.", price: "¥1,000" },
      { name: "Ebihachi", type: "Grill", desc: "Bœuf de Hida grillé au charbon. Fondant, juteux, inoubliable.", price: "¥3,500" }
    ],
    tips: "Si vous visitez Shirakawa-go (village classé UNESCO aux maisons gasshō-zukuri), Takayama est la base idéale. Bus direct en 50 min."
  },

  // ---- FUJISAN / MONT FUJI ----
  "fuji": {
    name: "Mont Fuji",
    nameJP: "富士山",
    image: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&q=80",
    intro: "Le Mont Fuji, à 3 776 m, n'est pas seulement le point culminant du Japon — c'est son symbole spirituel absolu. Qu'on le contemple de loin ou qu'on l'escalade, le Fuji-san dégage une majesté sereine qui a inspiré artistes et poètes pendant des millénaires.",
    highlights: [
      "Admirer le Fuji depuis le lac Kawaguchiko au lever du soleil",
      "L'escalader de nuit pour voir le « goraiko » (lever de soleil depuis le sommet)",
      "Visiter la pagode Chureito avec le Fuji en arrière-plan (THE photo classique)",
      "Explorer le Fuji Five Lakes (Fujigoko) et leurs panoramas",
      "Se baigner dans un onsen avec vue sur le Fuji"
    ],
    funFacts: [
      "Le Mont Fuji est un volcan actif dont la dernière éruption remonte à 1707. Les cendres sont tombées jusqu'à Tokyo.",
      "Environ 300 000 personnes escaladent le Fuji chaque année, principalement en juillet-août.",
      "Un proverbe japonais dit : « Celui qui n'escalade jamais le Fuji est un imbécile. Celui qui l'escalade deux fois est aussi un imbécile. »"
    ],
    restaurants: [
      { name: "Houtou Fudou", type: "Houtou", desc: "Plat traditionnel local : nouilles plates dans un bouillon miso épais avec du potiron. Parfait après la montagne.", price: "¥1,200" },
      { name: "Lake Bake", type: "Boulangerie", desc: "Boulangerie artisanale au bord du lac Kawaguchiko. Pain frais et vue spectaculaire.", price: "¥500" }
    ],
    tips: "Le Fuji n'est visible que par temps clair. Les meilleures chances : tôt le matin (avant 9h). La saison d'escalade est de début juillet à mi-septembre uniquement."
  },

  // ---- MIYAJIMA ----
  "miyajima": {
    name: "Miyajima",
    nameJP: "宮島",
    image: "https://images.unsplash.com/photo-1505069446780-4ef442b5207f?w=800&q=80",
    intro: "L'île sacrée de Miyajima, avec son immense torii vermillon semblant flotter sur l'eau, est l'un des trois panoramas les plus célèbres du Japon. L'île entière est considérée comme divine, peuplée de cerfs amicaux et entourée de forêts anciennes.",
    highlights: [
      "Voir le torii flottant d'Itsukushima à marée haute puis marcher jusqu'à lui à marée basse",
      "Prendre le téléphérique jusqu'au Mont Misen pour une vue à 360° sur la mer intérieure",
      "Se promener parmi les cerfs sur la plage au coucher du soleil",
      "Goûter les momiji manju (gâteaux en forme de feuille d'érable) frais et chauds"
    ],
    funFacts: [
      "Le torii du sanctuaire d'Itsukushima ne repose pas dans le sol — il tient debout par son propre poids (60 tonnes).",
      "L'île est si sacrée qu'aucun arbre n'a jamais été abattu sur le Mont Misen, rendant sa forêt primaire vieille de milliers d'années.",
      "Le momiji manju (gâteau à l'érable) a été inventé ici en 1906 et est devenu le souvenir le plus populaire d'Hiroshima."
    ],
    restaurants: [
      { name: "Yakigaki no Hayashi", type: "Huîtres", desc: "Huîtres grillées géantes de la mer intérieure. Simples, brûlantes, divines.", price: "¥1,200" },
      { name: "Sarasvati", type: "Curry", desc: "Curry japonais réconfortant dans un cadre cozy près du sanctuaire.", price: "¥1,000" }
    ],
    tips: "Restez pour le coucher de soleil — quand les touristes repartent en ferry, l'île retrouve sa sérénité sacrée. Vérifiez les horaires de marées pour le torii."
  },

  // ---- KOYASAN ----
  "koyasan": {
    name: "Kōya-san",
    nameJP: "高野山",
    image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80",
    intro: "Perché à 800m d'altitude au cœur d'une forêt de cèdres millénaires, le mont Kōya est le centre du bouddhisme Shingon fondé en 816. C'est ici que l'on vit l'expérience la plus profondément spirituelle du Japon : dormir dans un temple, méditer à l'aube, et marcher dans un cimetière de 200 000 tombes enveloppé de brume.",
    highlights: [
      "Dormir dans un temple (shukubo) et manger la cuisine végétarienne des moines",
      "Traverser l'Okunoin, le plus grand cimetière du Japon, à la lueur des lanternes",
      "Assister à la cérémonie du feu (goma) au temple Kongobu-ji",
      "Méditer avec les moines à l'aube",
      "Admirer le Danjo Garan et sa pagode Konpon Daito rouge vif"
    ],
    funFacts: [
      "Le fondateur Kobo Daishi n'est pas considéré comme mort — il serait en méditation éternelle dans son mausolée de l'Okunoin depuis 835.",
      "Les moines lui apportent encore deux repas par jour.",
      "Le cimetière Okunoin contient les tombes de nombreuses entreprises japonaises (Panasonic, Nissan...) qui ont construit des monuments pour leurs employés décédés."
    ],
    restaurants: [
      { name: "Shojin Ryori (au temple)", type: "Végétarien", desc: "Cuisine bouddhiste à base de tofu, légumes de montagne et goma-dofu. Simple mais profond.", price: "Inclus dans le shukubo" },
      { name: "Bon On Shaya", type: "Café", desc: "Petit café chaleureux au cœur du mont Koya. Matcha et gâteaux maison.", price: "¥600" }
    ],
    tips: "Réservez votre shukubo à l'avance. L'Okunoin est magique à la tombée de la nuit avec les lanternes. Prenez le funiculaire depuis Gokurakubashi."
  },

  // Fallback for unknown destinations
  "_default": {
    nameJP: "",
    image: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
    intro: "Une étape de votre voyage au Japon, à découvrir et explorer !",
    highlights: [
      "Flâner dans les rues et s'imprégner de l'ambiance locale",
      "Goûter les spécialités culinaires de la région",
      "Visiter les temples et sanctuaires locaux",
      "Échanger avec les habitants"
    ],
    funFacts: [
      "Chaque région du Japon possède ses propres spécialités culinaires et artisanales uniques."
    ],
    restaurants: [
      { name: "Izakaya local", type: "Izakaya", desc: "Trouvez un izakaya fréquenté par les locaux pour une expérience authentique.", price: "¥2,000-3,000" }
    ],
    tips: "N'hésitez pas à demander des recommandations aux locaux — les Japonais sont incroyablement serviables, même avec la barrière de la langue."
  }
};

// Helper to match a location name to the database
function findDestination(locationName) {
  if (!locationName) return DESTINATIONS_DB["_default"];
  const normalized = locationName.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();

  for (const key of Object.keys(DESTINATIONS_DB)) {
    if (key === "_default") continue;
    if (normalized.includes(key) || key.includes(normalized.split(/\s/)[0])) {
      return { ...DESTINATIONS_DB[key], name: DESTINATIONS_DB[key].name || locationName };
    }
  }
  // Check alternate names
  const aliases = {
    "mont fuji": "fuji", "kawaguchiko": "fuji", "kawaguchi": "fuji", "fujisan": "fuji",
    "koya": "koyasan", "koya-san": "koyasan", "mount koya": "koyasan",
    "itsukushima": "miyajima",
    "asakusa": "tokyo", "shinjuku": "tokyo", "shibuya": "tokyo", "akihabara": "tokyo", "ueno": "tokyo",
    "gion": "kyoto", "arashiyama": "kyoto", "fushimi": "kyoto",
    "dotonbori": "osaka", "namba": "osaka", "umeda": "osaka",
    "enoshima": "kamakura",
    "chuzenji": "nikko",
    "shirakawa": "takayama", "shirakawago": "takayama", "shirakawa-go": "takayama",
    "owakudani": "hakone", "ashi": "hakone",
    "hida": "takayama",
    "kenrokuen": "kanazawa"
  };
  for (const [alias, target] of Object.entries(aliases)) {
    if (normalized.includes(alias)) {
      return { ...DESTINATIONS_DB[target], name: DESTINATIONS_DB[target].name || locationName };
    }
  }

  return { ...DESTINATIONS_DB["_default"], name: locationName };
}
