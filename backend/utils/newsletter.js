// utils/newsletter.js

// Strips HTML and takes first 220 chars
function snippet(text) {
  return (text || '').replace(/<[^>]+>/g, '').slice(0, 220);
}

// Remove trailing slash from CLIENT_URL
function baseUrl() {
  return (process.env.CLIENT_URL || '').replace(/\/$/, '');
}

function buildNewPostEmailHtml(post, unsubscribeToken) {
  const postUrl = `${baseUrl()}/posts/${post._id}`;
  // 👇 note the /api/subscriptions/unsubscribe
  const unsubUrl = `${baseUrl()}/api/subscriptions/unsubscribe?token=${unsubscribeToken}`;

  return `
    <p>Lexoni artikullin e ri në <strong>Udhëkryqi.com</strong>:</p>
    <h2>${post.title}</h2>
    <p>${snippet(post.content)}...</p>
    <p><a href="${postUrl}">Lexoni shkrimin e plotë këtu</a></p>
    <hr />
    <p><a href="${unsubUrl}">Çabonohuni</a> nga lista e email-eve.</p>
  `;
}

function buildWelcomeEmailHtml(unsubscribeToken) {
  const unsubUrl = `${baseUrl()}/api/subscriptions/unsubscribe?token=${unsubscribeToken}`;

  return `
    <p>Faleminderit që u abonuat në <strong>Revistën Udhëkryqi</strong>.</p>
    <p>Nga tani e tutje do të merrni njoftime sa herë të botojmë një artikull të ri.</p>
    <hr />
    <p>Nëse dëshironi të çabonoheni në çdo kohë, klikoni te linku i çabonimit që do të gjeni në fund të çdo email-i.</p>
    <p><a href="${unsubUrl}">Çabonohuni</a> nga lista e email-eve.</p>  
  `;
}

module.exports = {
  buildWelcomeEmailHtml,
  buildNewPostEmailHtml,
};
