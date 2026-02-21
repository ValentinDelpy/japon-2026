// =============================================
// DESTINATIONS DATABASE — Japan Travel Guides
// Rich content for each major destination
// =============================================

const DESTINATIONS_DB = {
  // ---- TOKYO ----
  "tokyo": {
    name: "Tokyo",
    nameJP: "東京",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&q=80&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1599922407858-a3d0e1e6b7de?w=800&q=80&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1624601573012-efb68f3f150d?w=800&q=80&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1578469645742-46cae010e5d6?w=800&q=80&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?w=800&q=80&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&q=80&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1580533089532-54e9b8f62997?w=800&q=80&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1505069446780-4ef442b5207f?w=800&q=80&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80&auto=format&fit=crop",
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

  // ---- SHIRAKAWA-GO ----
  "shirakawa": {
    name: "Shirakawa-go",
    nameJP: "白川郷",
    image: "https://images.unsplash.com/photo-1611464908623-07f19927264e?w=800&q=80&auto=format&fit=crop",
    intro: "Village médiéval classé au patrimoine mondial de l'UNESCO, Shirakawa-go est célèbre pour ses maisons gasshō-zukuri — des constructions au toit de chaume en pente très raide, conçues pour supporter le poids de l'immense neige hivernale. En décembre, recouvertes de neige, elles offrent l'un des panoramas les plus féeriques du Japon.",
    highlights: [
      "Se promener dans les ruelles enneigées en décembre (illuminations nocturnes certains week-ends)",
      "Monter au belvédère de Shiroyama pour la vue panoramique sur tout le village",
      "Visiter l'intérieur d'une maison gasshō-zukuri au musée en plein air de Kanda-ke",
      "Déguster le sarubobo (poupée porte-bonheur local) et les produits du terroir montagnard"
    ],
    funFacts: [
      "Les maisons gasshō-zukuri ont des toits inclinés à 60° qui rappellent des mains jointes en prière — c'est ce que signifie gasshō en japonais.",
      "Ces toits peuvent supporter jusqu'à 2 mètres de neige et doivent être entièrement refaits tous les 30 à 40 ans, une opération collective appelée yui-nō.",
      "Le village est inscrit au patrimoine mondial de l'UNESCO depuis 1995."
    ],
    restaurants: [
      { name: "Doburoku Matsuri no Yakata", type: "Izakaya local", desc: "Spécialité locale : le doburoku, une sorte de saké artisanal légèrement brouillé, servi avec des plats du terroir.", price: "¥1,200" },
      { name: "Café des gastronames", type: "Café", desc: "Café chaleureux dans une maison gasshō-zukuri rénovée. Parfait pour se réchauffer avec un café et un gâteau maison.", price: "¥600" }
    ],
    tips: "Depuis Takayama, bus direct Nohi en 50 minutes. Le village se visite facilement en demi-journée. En hiver, certains week-ends de décembre il y a des illuminations nocturnes — vérifiez le programme exact avant de partir."
  },

  // ---- MAGOME ----
  "magome": {
    name: "Magome",
    nameJP: "馬籠",
    image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80&auto=format&fit=crop",
    intro: "Magome est un ancien bourg-relais de la route du Nakasendo, la voie terrestre qui reliait Tokyo à Kyoto à l'époque des shoguns. Ses ruelles en pavés, ses maisons en bois à la façade noire et ses boutiques d'artisanat offrent un voyage dans le Japon médiéval. C'est aussi le point de départ de la randonnée vers Tsumago, l'une des plus belles balades du Japon.",
    highlights: [
      "Marcher sur l'ancienne route du Nakasendo entre Magome et Tsumago (8 km de forêt et rizières)",
      "Explorer les ruelles pavées bordées de boutiques d'artisanat traditionnel",
      "Goûter les oyaki (galettes fourrées vapeur) et les senbei (crackers de riz) locaux",
      "Visiter le musée commémoratif de Shimazaki Toson, le grand écrivain né ici"
    ],
    funFacts: [
      "La route du Nakasendo était l'une des cinq routes officielles de l'ère Edo, utilisée notamment par les daimyō lors de leurs processions obligatoires vers Edo (Tokyo).",
      "Le service de bagagerie entre Magome et Tsumago permet aux randonneurs d'envoyer leurs sacs à l'avance — un service typiquement japonais de confort extrême.",
      "Magome et Tsumago sont deux des rares post-towns (juku) du Nakasendo à avoir conservé leur apparence d'époque intacte."
    ],
    restaurants: [
      { name: "Magome-chaya", type: "Auberge-restaurant", desc: "Cuisine locale du terroir montagnard : soba, sanglier et légumes de montagne.", price: "¥1,500" },
      { name: "Café Furusato", type: "Café", desc: "Petit café accueillant en milieu de randonnée. L'endroit parfait pour souffler sur un ginkgo mochi chaud.", price: "¥500" }
    ],
    tips: "Prenez le bus depuis Nagoya (1h30) ou Nagiso. La randonnée Magome-Tsumago prend 2h30 et est classée niveau facile. Un service de taxi bagages permet d'envoyer vos sacs au ryokan de Tsumago. Réservez à l'avance en décembre."
  },

  // Fallback for unknown destinations
  "_default": {
    nameJP: "",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80&auto=format&fit=crop",
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
  if (!locationName) {
    var d = Object.assign({}, DESTINATIONS_DB["_default"]);
    d._destKey = '_default';
    d.image = getDestImage('_default');
    return d;
  }
  const normalized = locationName.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();

  for (const key of Object.keys(DESTINATIONS_DB)) {
    if (key === "_default") continue;
    if (normalized.includes(key) || key.includes(normalized.split(/\s/)[0])) {
      var r = Object.assign({}, DESTINATIONS_DB[key], { name: DESTINATIONS_DB[key].name || locationName });
      r._destKey = key;
      r.image = getDestImage(key);
      return r;
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
    "shirakawa go": "shirakawa", "shirakawago": "shirakawa", "shirakawa-go": "shirakawa",
    "tsumago": "magome", "nakasendo": "magome", "kiso": "magome",
    "owakudani": "hakone", "ashi": "hakone",
    "hida": "takayama",
    "kenrokuen": "kanazawa"
  };
  for (const [alias, target] of Object.entries(aliases)) {
    if (normalized.includes(alias)) {
      var r2 = Object.assign({}, DESTINATIONS_DB[target], { name: DESTINATIONS_DB[target].name || locationName });
      r2._destKey = target;
      r2.image = getDestImage(target);
      return r2;
    }
  }

  var def = Object.assign({}, DESTINATIONS_DB["_default"], { name: locationName });
  def._destKey = '_default';
  def.image = getDestImage('_default');
  return def;
}

// =============================================
// CLIMATE DATA — Historical monthly averages
// =============================================
const WEATHER_CLIMATE = {
  // city key → month (0=Jan…11=Dec) → {high, low, rain%, icon, desc}
  tokyo: {
    10: {high:17,low:11,rain:8,icon:'☀️',desc:'Novembre est le mois le plus sec et ensoleillé de l\'automne à Tokyo. Températures descendant progressivement : −16°C mi-novembre, −12°C début décembre. Feuillages (momiji) à leur pic autour du 25–30 nov. Très peu de pluie.'},
    11: {high:12,low:6,rain:5,icon:'☀️',desc:'Décembre à Tokyo est frais et lumineux. Les ciels clairs permettent souvent d\'apercevoir le Fuji depuis la ville. Les illuminations de Noël décorent Shinjuku et Roppongi. Froid mais agréable.'}
  },
  kanazawa: {
    10: {high:14,low:7,rain:55,icon:'🌦️',desc:'Novembre à Kanazawa est beau malgré quelques averses. Le jardin Kenroku-en revêt ses couleurs d\'automne — un spectacle exceptionnel. Les premières pluies de l\'hiver arrivent en fin de mois.'},
    11: {high:9,low:3,rain:65,icon:'🌧️',desc:'Décembre marque le début de la saison des neiges à Kanazawa. La ville et le jardin Kenroku-en sous la neige sont magnifiques, mais il faut s\'habiller chaudement.'}
  },
  takayama: {
    10: {high:11,low:4,rain:32,icon:'🌤️',desc:'Novembre à Takayama : les feuillages d\'automne sont superbes et les températures fraîches. Shirakawa-go commence à se couvrir de neige en fin de mois — les premières neiges sont spectaculaires.'},
    11: {high:5,low:-1,rain:45,icon:'⛅',desc:'Décembre à Takayama est froid et enneigé. Les hameaux de Shirakawa-go sous la neige sont classés au patrimoine mondial — une vision féerique. Habillez-vous comme en montagne.'}
  },
  kyoto: {
    10: {high:17,low:10,rain:11,icon:'🌤️',desc:'Novembre à Kyoto : c\'est le moment le plus recherché de l\'année. Les érables (momiji) rougissent dans les temples à partir du 15 novembre. Foules importantes mais spectacle incomparable à Tofuku-ji et Arashiyama.'},
    11: {high:12,low:5,rain:9,icon:'☀️',desc:'Décembre à Kyoto est calme et serein. Les temples sans la foule, un ciel clair et parfois un peu de givre le matin. Les jardins Zen ont une beauté minimaliste et apaisante en hiver.'}
  },
  hiroshima: {
    10: {high:17,low:10,rain:14,icon:'🌤️',desc:'Novembre à Hiroshima est doux et agréable. La ville et l\'île de Miyajima sont parées de couleurs automnales. Le torii de Miyajima se reflète dans des eaux calmes et colorées.'},
    11: {high:12,low:4,rain:15,icon:'🌤️',desc:'Décembre à Hiroshima est frais et ensoleillé. Moins de touristes pour le mémorial et Miyajima. L\'atmosphère recueillie de ces lieux se prête particulièrement bien à la saison hivernale.'}
  },
  osaka: {
    10: {high:18,low:11,rain:10,icon:'🌤️',desc:'Novembre à Osaka : les cerisiers et érables en automne sont beaux, mais Osaka se vit surtout la nuit avec les néons de Dotonbori. Temps agréable pour se perdre dans les ruelles et manger.'},
    11: {high:13,low:6,rain:8,icon:'☀️',desc:'Décembre à Osaka est frais et festif. Les illuminations de Noël sont spectaculaires à Osaka Castle et Midosuji. Le konbini chaud et les izakayas deviennent vos meilleurs amis.'}
  },
  magome: {
    11: {high:7,low:1,rain:40,icon:'⛅',desc:'Décembre dans la vallée de Kiso est froid et magique. Le chemin de Nakasendo reliant Magome à Tsumago se couvre parfois de neige — une expérience de marche hors du temps dans un Japon médiéval intact.'}
  },
  shirakawa: {
    10: {high:9,low:2,rain:35,icon:'🌨️',desc:'Novembre-décembre à Shirakawa-go : la neige commence à tomber et le village se transforme en carte postale féerique. Les premières chutes de neige couvrent les toits gasshō-zukuri pour les plus beaux panoramas.'},
    11: {high:4,low:-3,rain:50,icon:'❄️',desc:'Décembre à Shirakawa-go est véritablement hivernal. Le village sous la neige est classé au patrimoine mondial — une vision magique inégalée. Habillez-vous chaudement et comptez une demi-journée pour en profiter pleinement.'}
  },
  nara: {
    10: {high:16,low:9,rain:11,icon:'🌤️',desc:'Novembre à Nara : les cerfs se promènent parmi les arbres aux couleurs de feu autour du Todai-ji. C\'est l\'une des visions les plus iconiques du Japon automnal.'},
    11: {high:12,low:4,rain:9,icon:'☀️',desc:'Décembre à Nara : le parc est calme, les cerfs ont l\'air frigorifiés mais sont toujours aussi accueillants. Le temple Todai-ji sous un ciel hivernal a une beauté austère saisissante.'}
  },
  // Fallback pour villes inconnues — données Japon central
  _default: {
    10: {high:15,low:8,rain:15,icon:'🌤️',desc:'Novembre au Japon est généralement agréable, avec des températures fraîches et de beaux paysages automnaux.'},
    11: {high:10,low:3,rain:12,icon:'🌤️',desc:'Décembre est frais et sec sur la majeure partie du Japon central. Bonnes conditions pour voyager.'}
  }
};

function getCityWeatherKey(cityName) {
  if (!cityName) return '_default';
  const n = cityName.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9\s]/g,'').trim();
  const known = ['tokyo','kanazawa','takayama','kyoto','hiroshima','osaka','magome','nara','hakone','nikko','kamakura','miyajima','koyasan','shirakawa'];
  for (const k of known) {
    if (n.includes(k) || k.includes(n.split(/\s/)[0])) return k;
  }
  if (n.includes('aeroport') || n.includes('airport')) return null;
  return '_default';
}

// ── Robust Image System ──
// Each destination has a chain of URLs to try in order.
// If ALL fail, a beautiful CSS gradient is used as placeholder.

// URL strategy: Special:FilePath = no hash needed (Wikimedia handles redirect)
// Unsplash images.unsplash.com = reliable CDN, no auth required for background-image
// Each destination has 5-6 URLs tried in order — first success wins.
const W = 'https://commons.wikimedia.org/wiki/Special:FilePath/'; // Wikimedia redirect, no hash
const U = 'https://images.unsplash.com/photo-';                   // Unsplash CDN

// Unsplash CDN base — photo IDs are stable, no auth required for background-image CSS
const _U = 'https://images.unsplash.com/photo-';
const _S = '?w=800&q=80&auto=format&fit=crop';
const _W = 'https://commons.wikimedia.org/wiki/Special:FilePath/';

const IMG_CHAIN = {
  // Each destination: [primary, alt1, alt2, wikimedia_fallback]
  "tokyo":     [_U+'1540959733332-eab4deabeeaf'+_S, _U+'1542051841857-5f90071e7989'+_S, _U+'1513407030348-c983a97b98d8'+_S, _W+'Skyscrapers_of_Shinjuku_2009_January.jpg?width=800'],
  "kyoto":     [_U+'1493976040374-85c8e12f0c0e'+_S, _U+'1534271291059-a2657dc59d39'+_S, _U+'1524413840837-e60f85ebef20'+_S, _W+'Fushimi_Inari-taisha2.jpg?width=800'],
  "osaka":     [_U+'1590559899731-a382839e5549'+_S, _U+'1506905925346-21bda4f565b9'+_S, _U+'1548191194-b5d9d0a31e91'+_S, _W+'Osaka_Castle_in_november_2008.jpg?width=800'],
  "hiroshima": [_U+'1599922407858-a3d0e1e6b7de'+_S, _U+'1610634780695-8e5a44c06ba5'+_S, _W+'Atomic_Bomb_Dome_Hiroshima.jpg?width=800'],
  "nara":      [_U+'1624601573012-efb68f3f150d'+_S, _U+'1590422749897-47036da0a56e'+_S, _U+'1609252925564-47e7d2c0bd14'+_S, _W+'Nara_Todaiji_Daibutsuden_Nov2007.jpg?width=800'],
  "hakone":    [_U+'1528164344705-47542687000d'+_S, _U+'1551632811-89700e9cbf62'+_S, _U+'1612736831923-b3da79a6f49d'+_S, _W+'FujiFromHakone.jpg?width=800'],
  "nikko":     [_U+'1578469645742-46cae010e5d6'+_S, _U+'1587595433636-c7dee0a03dac'+_S, _W+'Nikko_Tosho-gu2.jpg?width=800'],
  "kamakura":  [_U+'1578469550956-0e16b69c6a3d'+_S, _U+'1524413840837-e60f85ebef20'+_S, _W+'Kotoku-in_Kamakura.jpg?width=800'],
  "kanazawa":  [_U+'1567767292278-a4f21aa2d36e'+_S, _U+'1590422749897-47036da0a56e'+_S, _W+'Kenroku-en_02.jpg?width=800'],
  "takayama":  [_U+'1580533089532-54e9b8f62997'+_S, _U+'1572879502423-4c12a99c9ba2'+_S, _W+'Hida_Folk_Village_2009.jpg?width=800'],
  "shirakawa": [_U+'1611464908623-07f19927264e'+_S, _U+'1504432842725-2a5c0aeed1e4'+_S, _W+'Ogimachi_Shirakawa-go.jpg?width=800'],
  "miyajima":  [_U+'1505069446780-4ef442b5207f'+_S, _U+'1609252925564-47e7d2c0bd14'+_S, _W+'Miyajima_in_japan.jpg?width=800'],
  "koyasan":   [_U+'1545569341-9eb8b30979d9'+_S, _U+'1534271291059-a2657dc59d39'+_S, _W+'Okunoin_cemetery_Koyasan.jpg?width=800'],
  "magome":    [_U+'1528360983277-13d401cdc186'+_S, _U+'1572879502423-4c12a99c9ba2'+_S, _W+'Magome-juku.jpg?width=800'],
  "_default":  [_U+'1540959733332-eab4deabeeaf'+_S, _U+'1551632811-89700e9cbf62'+_S]
};

// Gradient placeholders per destination (used when all URLs fail)
const IMG_GRADIENTS = {
  "tokyo":     "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #c73e1d 100%)",
  "kyoto":     "linear-gradient(135deg, #2d1b69 0%, #6b4fa0 50%, #d4a843 100%)",
  "osaka":     "linear-gradient(135deg, #1a3a4a 0%, #2a6478 50%, #e76f51 100%)",
  "hiroshima": "linear-gradient(135deg, #1e3a5f 0%, #2a5298 50%, #40b5a6 100%)",
  "nara":      "linear-gradient(135deg, #2d4a1e 0%, #4a7a32 50%, #789048 100%)",
  "hakone":    "linear-gradient(135deg, #1a3a5c 0%, #2c5f8a 50%, #87ceeb 100%)",
  "nikko":     "linear-gradient(135deg, #2d1b00 0%, #6b3f00 50%, #d4a843 100%)",
  "kamakura":  "linear-gradient(135deg, #1a3a4a 0%, #006994 50%, #40b5a6 100%)",
  "kanazawa":  "linear-gradient(135deg, #1e2d4a 0%, #2a4a6e 50%, #c47e7e 100%)",
  "takayama":  "linear-gradient(135deg, #2d1a0e 0%, #5c3a1e 50%, #789048 100%)",
  "shirakawa": "linear-gradient(135deg, #1a2d3a 0%, #2d4a5c 50%, #87ceeb 100%)",
  "miyajima":  "linear-gradient(135deg, #2d0a0a 0%, #8b1a1a 50%, #c73e1d 100%)",
  "koyasan":   "linear-gradient(135deg, #0a1a0a 0%, #1a3a1a 50%, #606c38 100%)",
  "magome":    "linear-gradient(135deg, #1a1a0a 0%, #3a3a1a 50%, #789048 100%)",
  "_default":  "linear-gradient(135deg, #264653 0%, #2a9d8f 100%)",
};

// Resolved image cache: destKey → working URL or null (null = use gradient)
const _imgCache = {};
const _imgLoading = {};

// Normalise a city/dest name to a key for lookup
function _destKey(name) {
  if (!name) return '_default';
  const n = String(name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'').trim();
  const keys = Object.keys(IMG_CHAIN);
  for (const k of keys) { if (k !== '_default' && (n.includes(k) || k.includes(n.substring(0,5)))) return k; }
  return '_default';
}

// Try loading a chain of URLs; resolves with the first that works, or null
function _tryImageChain(urls, idx) {
  if (idx === undefined) idx = 0;
  if (idx >= urls.length) return Promise.resolve(null);
  return new Promise(function(resolve) {
    var img = new Image();
    var timer = setTimeout(function() {
      img.onload = img.onerror = null;
      img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
      _tryImageChain(urls, idx + 1).then(resolve);
    }, 5000);
    img.onload = function() { clearTimeout(timer); resolve(urls[idx]); };
    img.onerror = function() { clearTimeout(timer); _tryImageChain(urls, idx + 1).then(resolve); };
    img.src = urls[idx];
  });
}

// Apply a resolved image (URL or null→gradient) to all matching elements
function _applyImg(key, url) {
  var style = url ? "url('" + url + "')" : IMG_GRADIENTS[key] || IMG_GRADIENTS['_default'];
  document.querySelectorAll('[data-dest-key="'+key+'"]').forEach(function(el) {
    el.style.backgroundImage = style;
    if (!url) el.classList.add('img-fallback-gradient');
  });
}

// Test + apply all images in the page
function _repairBrokenImages() {
  var pending = {};
  document.querySelectorAll('[data-dest-key]').forEach(function(el) {
    var key = el.getAttribute('data-dest-key');
    if (_imgCache.hasOwnProperty(key)) {
      _applyImg(key, _imgCache[key]);
    } else if (!_imgLoading[key]) {
      _imgLoading[key] = true;
      pending[key] = true;
    }
  });
  Object.keys(pending).forEach(function(key) {
    var chain = IMG_CHAIN[key] || IMG_CHAIN['_default'];
    _tryImageChain(chain).then(function(url) {
      _imgCache[key] = url;
      _applyImg(key, url);
    });
  });
}

// Return primary URL for initial render (repair will fix if broken)
function getDestImage(destName) {
  var key = _destKey(destName);
  if (_imgCache.hasOwnProperty(key) && _imgCache[key]) return _imgCache[key];
  var chain = IMG_CHAIN[key] || IMG_CHAIN['_default'];
  return chain[0] || '';
}

function getWeatherForDate(cityName, dateObj) {
  const key = getCityWeatherKey(cityName);
  if (!key) return null;
  const db = WEATHER_CLIMATE[key] || WEATHER_CLIMATE['_default'];
  const month = dateObj.getMonth();
  const data = db[month] || db[Object.keys(db)[0]];
  // Slight realistic day-of-month variation
  const dayInMonth = dateObj.getDate();
  const variation = Math.sin(dayInMonth * 0.4) * 1.5;
  return {
    icon: data.icon,
    high: Math.round(data.high + variation),
    low:  Math.round(data.low  + variation * 0.6),
    rain: Math.max(0, Math.round(data.rain + variation * 2)),
    desc: data.desc
  };
}
