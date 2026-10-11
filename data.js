// Mosaic's fictional, browser-local demo world. Never merge these IDs into real accounts.
const photo = (id, w = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=85`;
const art = name => `/assets/${name}.svg`;
const original = { name: 'Original Mosaic demo artwork', url: '/ASSET-SOURCES.md', license: 'Original SVG artwork created for Mosaic' };
const sourced = id => ({ name: 'Unsplash · curated inspiration', url: `https://images.unsplash.com/photo-${id}`, license: 'Unsplash License · https://unsplash.com/license' });
const defaults = { visibility: 'public', messagePolicy: 'everyone', invitePolicy: 'everyone', sections: ['projects', 'boards', 'posts'], fictional: true, links: [] };

export const DEMO_ME = {
  ...defaults, id: 'evelyn', name: 'Evelyn Park', username: 'evelynmakes',
  bio: 'Collecting little wonders. Making things slowly. Somewhere between a sketchbook and a very long playlist.',
  avatar: art('avatar-evelyn'), cover: art('cover-world'),
  descriptor: 'A collector of little wonders',
  interests: ['Photography', 'Design', 'Indie music', 'Art'], aesthetics: ['Botanical', 'Vintage', 'Eclectic'],
  descriptors: ['Curious', 'Thoughtful', 'Playful'], goals: ['Friends', 'Inspiration', 'Creative collaborators'],
  skills: ['Illustration', 'Photography'], skill: 'Illustration', location: 'Singapore', accent: '#9a8bab',
  creativeGoal: 'Make a little printed journal of everyday things worth noticing.',
};

export const profiles = [
  { ...defaults, id: 'mila', name: 'Mila Chen', username: 'milainbloom', avatar: art('avatar-mila'), cover: photo('1441974231531-c6227db76b6e'), bio: 'Botanical sketches, imperfect ceramics, and an unreasonable number of houseplants. Let’s make something with our hands.', descriptor: 'Quietly growing', interests: ['Art', 'Ceramics', 'Photography', 'Nature'], aesthetics: ['Botanical', 'Minimal'], descriptors: ['Observant', 'Warm', 'Patient'], goals: ['Friends', 'Creative collaborators'], skills: ['Illustration', 'Ceramics'], skill: 'Illustration', lookingFor: 'Photography', location: 'Melbourne', accent: '#8a9c82', creativeGoal: 'Find a photographer for a small ceramics lookbook.' },
  { ...defaults, id: 'leo', name: 'Leo Santos', username: 'leoafterlight', avatar: art('avatar-leo'), cover: photo('1500530855697-b586d89ba3ee'), bio: 'Chasing the light between the buildings. Film photography, late trains, and making playlists for imaginary movies.', descriptor: 'Chasing the in-between', interests: ['Photography', 'Film', 'Indie music', 'Architecture'], aesthetics: ['Cinematic', 'Vintage'], descriptors: ['Curious', 'Easygoing', 'Adventurous'], goals: ['Friends', 'Inspiration', 'Shared hobbies'], skills: ['Photography', 'Video editing'], skill: 'Photography', location: 'Lisbon', accent: '#bc9476', creativeGoal: 'Turn a month of evening walks into a photo zine.' },
  { ...defaults, id: 'sora', name: 'Sora Kim', username: 'sorastudio', avatar: art('avatar-sora'), cover: art('soft-systems'), bio: 'A designer who likes computers with personality. Exploring tiny digital gardens and interfaces that feel like home.', descriptor: 'Making space for wonder', interests: ['Design', 'Coding', 'Gaming', 'Art'], aesthetics: ['Futuristic', 'Minimal', 'Eclectic'], descriptors: ['Playful', 'Inventive', 'Thoughtful'], goals: ['Creative collaborators', 'Inspiration'], skills: ['Design', 'Prototyping'], skill: 'Design', lookingFor: 'Coding', location: 'Seoul', accent: '#a192c1', creativeGoal: 'Build a tiny interactive garden with a creative developer.' },
  { ...defaults, id: 'theo', name: 'Theo Brooks', username: 'theosunday', avatar: art('avatar-theo'), cover: photo('1470225620780-dba8ba36b745'), bio: 'Bedroom producer. Sunday record-store regular. I’m usually thinking about how a city would sound if it were a song.', descriptor: 'Always listening', interests: ['Music', 'Indie music', 'Film', 'Photography'], aesthetics: ['Vintage', 'Cinematic'], descriptors: ['Reflective', 'Open-minded', 'Playful'], goals: ['Friends', 'Creative collaborators', 'Shared hobbies'], skills: ['Music production', 'Sound design'], skill: 'Music production', lookingFor: 'Illustration', location: 'Bristol', accent: '#b88d84', creativeGoal: 'Find an illustrator to make cover art for a four-track EP.' },
  { ...defaults, id: 'amara', name: 'Amara Okafor', username: 'amarainform', avatar: art('avatar-amara'), cover: photo('1487958449943-2429e8be8625'), bio: 'Interested in the spaces we share and the small details we walk past. Architecture, collages, and very strong coffee.', descriptor: 'Seeing things differently', interests: ['Architecture', 'Design', 'Art', 'Fashion'], aesthetics: ['Minimal', 'Eclectic'], descriptors: ['Observant', 'Bold', 'Thoughtful'], goals: ['Inspiration', 'Creative collaborators'], skills: ['Architecture', 'Collage'], skill: 'Architecture', lookingFor: 'Photography', location: 'London', accent: '#bb8e69', creativeGoal: 'Collect stories about the corners of our cities that feel like home.' },
  { ...defaults, id: 'jules', name: 'Jules Laurent', username: 'julesinmargins', avatar: art('avatar-jules'), cover: photo('1455390582262-044cdead277a'), bio: 'Writing little things in the margins. Reading slowly. Looking for a book-club friend who is happy to get distracted.', descriptor: 'A work in progress', interests: ['Writing', 'Literature', 'Film', 'Art'], aesthetics: ['Vintage', 'Minimal'], descriptors: ['Reflective', 'Curious', 'Gentle'], goals: ['Friends', 'Shared hobbies', 'Inspiration'], skills: ['Writing', 'Editing'], skill: 'Writing', location: 'Montreal', accent: '#bca77a', creativeGoal: 'Finish a tiny collection of prose poems about ordinary mornings.' },
  { ...defaults, id: 'niko', name: 'Niko Rivera', username: 'nikobuilds', avatar: art('avatar-niko'), cover: art('digital-garden'), bio: 'Creative coding, handmade games, and a browser tab for every unfinished idea. Happy to help good weird projects exist.', descriptor: 'Curiously under construction', interests: ['Coding', 'Gaming', 'Music', 'Design'], aesthetics: ['Futuristic', 'Eclectic'], descriptors: ['Inventive', 'Playful', 'Curious'], goals: ['Creative collaborators', 'Friends'], skills: ['Coding', 'Creative coding', 'Game design'], skill: 'Coding', lookingFor: 'Design', location: 'Barcelona', accent: '#7c9992', creativeGoal: 'Collaborate on a gentle browser game with an illustrator or designer.' },
  { ...defaults, id: 'ines', name: 'Inès Moreau', username: 'inescollects', avatar: art('avatar-ines'), cover: photo('1490481651871-ab68de25d43d'), bio: 'Old clothes, new stories. I collect textures, flea-market treasures, and reasons to take the scenic route.', descriptor: 'Beautifully second-hand', interests: ['Fashion', 'Photography', 'Design', 'Literature'], aesthetics: ['Vintage', 'Botanical', 'Eclectic'], descriptors: ['Expressive', 'Warm', 'Adventurous'], goals: ['Friends', 'Inspiration', 'Creative collaborators'], skills: ['Styling', 'Photography'], skill: 'Styling', location: 'Paris', accent: '#b78d91', creativeGoal: 'Photograph a wardrobe diary made entirely from second-hand finds.' },
];

const imagePost = (id, creatorId, title, caption, imageId, category, tags, height, color) => ({ id, creatorId, title, caption, image: photo(imageId), category, tags, kind: 'image', height, source: sourced(imageId), color, tools: [], link: '', contentOrigin: 'saved-inspiration', createdAt: '2026-10-10T08:00:00.000Z' });
const artworkPost = (id, creatorId, title, caption, file, category, tags, height, color, kind = 'image', tools = []) => ({ id, creatorId, title, caption, image: art(file), category, tags, kind, height, source: { ...original }, color, tools, link: '', contentOrigin: 'original-demo-work', createdAt: '2026-10-09T12:00:00.000Z' });

export const posts = [
  imagePost('p01', 'mila', 'A softer kind of morning', 'Saving this little corner for its quiet colours. A reminder that a room can leave space to breathe.', '1494438639946-1ebd1d20bf85', 'Design', ['Interiors', 'Slow living', 'Botanical'], 355, '#d9d2bd'),
  artworkPost('p02', 'evelyn', 'Make room for wonder', 'A little reminder from my sketchbook, made into a poster. There is always room for one more curious thought.', 'wonder-poster', 'Art', ['Typography', 'Print design', 'Playful'], 275, '#b9b0ce', 'project', ['Vector illustration', 'Typography']),
  imagePost('p03', 'leo', 'Somewhere, unhurried', 'An open road, evening light, and no particular hurry. Keeping this in my light-and-colour reference board.', '1500530855697-b586d89ba3ee', 'Photography', ['Travel', 'Cinematic', 'Warm light'], 330, '#aab5ab'),
  artworkPost('p04', 'mila', 'Studies in growing', 'Leaf shapes drawn from memory, then rearranged like a tiny paper garden. Part of an ongoing botanical print series.', 'botanical-study', 'Art', ['Botanical', 'Illustration', 'Sage'], 390, '#d3dbbe', 'project', ['Ink', 'Vector illustration']),
  imagePost('p05', 'amara', 'The shape of a quiet day', 'Beautiful geometry I am saving for a study of light, space, and how buildings make us look up.', '1487958449943-2429e8be8625', 'Design', ['Architecture', 'Minimal', 'Geometry'], 285, '#d9d4cb'),
  imagePost('p06', 'ines', 'A wardrobe with a past', 'Colours and textures for the next wardrobe diary. Thinking about pieces that feel better after years of wear.', '1490481651871-ab68de25d43d', 'Art', ['Fashion', 'Vintage', 'Textures'], 360, '#dbcdc0'),
  imagePost('p07', 'leo', 'The sea has its own rhythm', 'Collecting ocean textures for a photo-zine moodboard. I keep coming back to this blue.', '1518837695005-2083093ee35b', 'Photography', ['Ocean', 'Nature', 'Blue'], 300, '#b0c4cc'),
  artworkPost('p08', 'theo', 'Songs for the blue hour', 'An imaginary sleeve for sounds that belong just after sunset. A visual sketch for my next little EP.', 'blue-hour', 'Music', ['Indie music', 'Album art', 'Sound'], 340, '#8b8fac', 'project', ['Sound design', 'Vector illustration']),
  imagePost('p09', 'jules', 'Notes from the margins', 'A writing-desk reference for my mornings board. A blank page is just a little space waiting to be filled.', '1455390582262-044cdead277a', 'Writing', ['Journaling', 'Literature', 'Slow living'], 285, '#d7c7ae'),
  imagePost('p10', 'mila', 'A good place to get lost', 'Saving forest light for an upcoming palette study. So many greens pretending to be one colour.', '1441974231531-c6227db76b6e', 'Photography', ['Nature', 'Botanical', 'Green'], 375, '#778668'),
  artworkPost('p11', 'sora', 'Soft systems, small worlds', 'An interface can have a little soul. Early visual studies for a playful collection of digital objects.', 'soft-systems', 'Design', ['Digital art', 'Design', 'Lavender'], 300, '#ccc1d9', 'project', ['Figma', 'Vector illustration']),
  imagePost('p12', 'theo', 'The best part of being here', 'A live-music reference for the energy board. Looking for the visual equivalent of a chorus everyone knows.', '1493225457124-a3eb161ffa5f', 'Music', ['Live music', 'Cinematic', 'Community'], 355, '#997b74'),
  imagePost('p13', 'evelyn', 'Colours I want to carry', 'A paint-table reference. Making a small palette of colours that feel like a warm Sunday afternoon.', '1513364776144-60967b0f800f', 'Art', ['Colour', 'Painting', 'Studio'], 280, '#c5a993'),
  artworkPost('p14', 'jules', 'The things we almost miss', 'Today I noticed the shadow of a glass, a small dog in a big coat, and someone holding a door a little longer. A pocket-sized field note.', 'field-notes', 'Writing', ['Poetry', 'Journaling', 'Noticing'], 360, '#eadfce', 'reflection'),
  imagePost('p15', 'amara', 'Objects with room to breathe', 'A gallery-wall reference for a collage series. Interested in the conversation between objects and the spaces around them.', '1513519245088-0e12902e5a38', 'Design', ['Interiors', 'Art', 'Curation'], 310, '#cec2b5'),
  imagePost('p16', 'ines', 'Finding something unexpected', 'A small visual note for my style collection: texture, movement, and an eye for the details.', '1483985988355-763728e1935b', 'Art', ['Fashion', 'Street style', 'Textures'], 385, '#b4aea0'),
  artworkPost('p17', 'niko', 'A garden in your browser', 'A concept sketch for a tiny digital garden where every key grows a different shape. Looking for someone to design its little world with me.', 'digital-garden', 'Technology', ['Creative coding', 'Gaming', 'Design'], 315, '#acc4b2', 'project', ['JavaScript', 'Canvas', 'Generative design']),
  imagePost('p18', 'leo', 'When the hills exhale', 'Landscape inspiration for a slow weekend. Keeping a little collection of places that make the world feel wide.', '1470071459604-3b5ec3a7fe05', 'Photography', ['Landscape', 'Nature', 'Cinematic'], 295, '#a7b4a5'),
  imagePost('p19', 'amara', 'Rooms for new ideas', 'A workspace reference for a project about shared creative spaces. Light first, furniture second.', '1449247709967-d4461a6a6103', 'Design', ['Architecture', 'Interiors', 'Minimal'], 345, '#c9c4b7'),
  artworkPost('p20', 'evelyn', 'A little lunar daydream', 'An original print about the space between having an idea and making it real. Part of my Small Wonders collection.', 'moon-garden', 'Art', ['Celestial', 'Illustration', 'Dreamy'], 405, '#8d8ca5', 'project', ['Vector illustration', 'Print design']),
  imagePost('p21', 'niko', 'Under the surface', 'Circuit-board detail for my texture library. A useful reminder that even very practical systems have their own visual rhythm.', '1518770660439-4636190af475', 'Technology', ['Technology', 'Patterns', 'Coding'], 285, '#969e8b'),
  imagePost('p22', 'theo', 'Let the evening happen', 'Saving stage light and colour as references for the next cover. I like the moment before you know what song comes next.', '1470225620780-dba8ba36b745', 'Music', ['Music', 'Light', 'Night'], 335, '#877181'),
  imagePost('p23', 'mila', 'Everything green, everywhere', 'Nature as a colour reference. Building a palette around that fresh, almost-luminous shade of green.', '1500534623283-312aade485b7', 'Photography', ['Nature', 'Green', 'Botanical'], 365, '#91a875'),
  artworkPost('p24', 'amara', 'Between sun and shadow', 'A paper-like composition made from the shapes I keep noticing on walks: arches, stairs, circles, and a generous patch of sky.', 'sun-study', 'Art', ['Collage', 'Architecture', 'Warm tones'], 300, '#c8a994', 'project', ['Collage', 'Vector illustration']),
  imagePost('p25', 'jules', 'A ritual worth keeping', 'Coffee-shop texture for the everyday-rituals collection. One warm drink and ten minutes without reaching for my phone.', '1495474472287-4d71bcdd2085', 'Writing', ['Coffee', 'Slow living', 'Mornings'], 300, '#b2a08b'),
  imagePost('p26', 'ines', 'A place for beautiful things', 'A shop-window reference for colour, rhythm, and how objects tell stories together.', '1441986300917-64674bd600d8', 'Design', ['Fashion', 'Interiors', 'Curation'], 340, '#c5b1a0'),
];

export const boards = [
  { id: 'board-everyday', ownerId: 'evelyn', name: 'Everyday little wonders', description: 'The light, colours, and quiet details I want to keep.', postIds: ['p01', 'p03', 'p07', 'p13', 'p25'], visibility: 'public' },
  { id: 'board-dream', ownerId: 'evelyn', name: 'Soft worlds', description: 'Dreamy shapes, lavender evenings, and a little imagination.', postIds: ['p02', 'p08', 'p11', 'p20'], visibility: 'public' },
  { id: 'board-green', ownerId: 'mila', name: 'Things that grow', description: 'Leaves, slow mornings, and a hundred shades of green.', postIds: ['p04', 'p10', 'p18', 'p23'], visibility: 'public' },
  { id: 'board-light', ownerId: 'leo', name: 'Chasing the afterlight', description: 'Places I want to photograph and colours I want to remember.', postIds: ['p03', 'p07', 'p12', 'p18'], visibility: 'public' },
  { id: 'board-form', ownerId: 'amara', name: 'A feeling for form', description: 'Architecture, negative space, and the quiet geometry of things.', postIds: ['p05', 'p11', 'p15', 'p19', 'p24'], visibility: 'public' },
  { id: 'board-notes', ownerId: 'jules', name: 'In the margins', description: 'A collection for slow reading and little everyday rituals.', postIds: ['p09', 'p14', 'p25'], visibility: 'public' },
  { id: 'board-play', ownerId: 'niko', name: 'Small playful systems', description: 'Creative coding and interfaces with a little personality.', postIds: ['p11', 'p17', 'p21'], visibility: 'public' },
  { id: 'board-texture', ownerId: 'ines', name: 'The texture of a day', description: 'Well-loved fabrics, good light, and everyday collections.', postIds: ['p06', 'p16', 'p26', 'p01'], visibility: 'public' },
];

export const conversations = [
  { id: 'chat-mila', participants: ['evelyn', 'mila'], accepted: true, unread: 1, messages: [
    { id: 'msg-1', senderId: 'mila', text: 'Your moon garden print has such lovely colours. I’ve been using almost the same sage in my sketchbook lately.', createdAt: '2026-10-10T09:10:00.000Z' },
    { id: 'msg-2', senderId: 'evelyn', text: 'Thank you! I keep collecting shades of green everywhere I go. Your botanical studies are beautiful.', createdAt: '2026-10-10T09:12:00.000Z' },
    { id: 'msg-3', senderId: 'mila', text: 'Maybe we could trade a few colour palettes sometime? I’m putting together a little ceramics lookbook.', createdAt: '2026-10-10T09:14:00.000Z' },
  ] },
  { id: 'chat-theo', participants: ['evelyn', 'theo'], accepted: true, unread: 0, messages: [
    { id: 'msg-4', senderId: 'theo', text: 'I saved your wonder poster. It feels exactly like the kind of music I’m trying to make.', createdAt: '2026-10-09T13:30:00.000Z' },
    { id: 'msg-5', senderId: 'evelyn', text: 'That’s a lovely way to describe it. I’d love to hear what you’re working on.', createdAt: '2026-10-09T14:01:00.000Z' },
  ] },
  { id: 'chat-leo', participants: ['evelyn', 'leo'], accepted: false, unread: 1, requestedBy: 'leo', messages: [
    { id: 'msg-6', senderId: 'leo', text: 'Hello! We seem to collect the same kind of light. Would you like to trade a few favourite photography references?', createdAt: '2026-10-10T11:06:00.000Z' },
  ] },
];

export const notifications = [
  { id: 'note-1', type: 'follow', text: 'Mila Chen started following your world.', profileId: 'mila', read: false, createdAt: '2026-10-10T10:15:00.000Z' },
  { id: 'note-2', type: 'like', text: 'Theo Brooks liked Make room for wonder.', profileId: 'theo', postId: 'p02', read: false, createdAt: '2026-10-10T09:25:00.000Z' },
  { id: 'note-3', type: 'message', text: 'Leo Santos sent you a message request.', profileId: 'leo', conversationId: 'chat-leo', read: false, createdAt: '2026-10-10T11:06:00.000Z' },
  { id: 'note-4', type: 'save', text: 'Inès Moreau saved A little lunar daydream.', profileId: 'ines', postId: 'p20', read: true, createdAt: '2026-10-09T12:00:00.000Z' },
];

export function makeDemoState() {
  return JSON.parse(JSON.stringify({ version: 1, mode: 'demo', me: DEMO_ME, profiles, posts, boards, conversations, notifications, follows: ['mila', 'theo'], likes: [], comments: [], blocks: [], reports: [], invitations: [], matches: [], gameHistory: [], practice: null, onboarded: false }));
}
