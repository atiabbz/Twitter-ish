//stuff that needs to happen on page load
document.addEventListener('DOMContentLoaded', () => {
  currentURL = window.location.href;
  usernameEl = document.querySelector('#username');
  if (usernameEl && !currentURL.includes('all/following') && currentURL.includes('all')) {
    document.querySelector('#new').onsubmit = newPost;
  }

  if (currentURL.includes('/all/following')) {
    pagination('allFollowing', 'page1');
    loadPage('allFollowing', 'page1');
  } else if (currentURL.includes('/all')) {
    pagination('all', 'page1');
    loadPage('all', 'page1');
  } else if (currentURL.includes('/profile')) {
    profileName = document.querySelector('#profileName').innerHTML;
    pagination(profileName, 'page1');
    loadPage(profileName, 'page1');
    profileView(profileName);
  }



});

function newPost(event) {
  event.preventDefault();
  console.log('newPost called');
  fetch('/new', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'X-CSRFToken': getCookie('csrftoken') },
    body: JSON.stringify({
      content: document.querySelector('#content').value,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log(result);
    });
  setTimeout(() => {
    document.querySelector('#posts-view').innerHTML =
      `<div class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span >
        </div>
      </div>`;
    document.querySelector('#content').value = '';
    pagination('all', 'page1');
    loadPage('all', 'page1');
  }, 10);
}

function getCurrentPage() {
  return parseInt(document.querySelector('.active').firstChild.innerHTML);
}

function pagination(username, pageN) {
  fetch(`/numPages/${username}`)
  .then(response => response.json())
  .then(numPages => {
    // console.log(numPages);
    const nextBtn = document.querySelector('#next');
    const prevBtn = document.querySelector('#previous');

    if (numPages === 1) {
        nextBtn.classList.add('disabled')
    }

    document.querySelectorAll('.pageBtn').forEach(pageBtn => pageBtn.parentElement.remove());
    for (let i = 1; i <= numPages; i++) {
      const li = document.createElement('li');
      li.setAttribute('class', 'page-item');
      li.innerHTML = `<a id="page${i}" class="pageBtn page-link" href="#">${i}</a>`;
      nextBtn.insertAdjacentElement('beforebegin', li);
    }
    document.querySelector(`#${pageN}`).parentElement.classList.add('active');

    const pageBtns = document.querySelectorAll('.pageBtn');
    pageBtns.forEach(pageBtn => {
      pageBtn.onclick = () => {
        document.querySelector('.active').classList.remove('active');
        pageBtn.parentElement.classList.add('active');

        const currentURL = window.location.href;
        if (currentURL.includes('/all/following')) {
          pagination('allFollowing', `page${getCurrentPage()}`);
          loadPage('allFollowing', `page${getCurrentPage()}`);
        } else if (currentURL.includes('/all')) {
          pagination('all', `page${getCurrentPage()}`);
          loadPage('all', `page${getCurrentPage()}`);
        } else if (currentURL.includes('/profile')) {
          profileName = document.querySelector('#profileName').innerHTML;
          pagination(profileName, `page${getCurrentPage()}`);
          loadPage(profileName, `page${getCurrentPage()}`);
        }

        if (getCurrentPage() === numPages) {
          nextBtn.classList.add('disabled');
        } else {
          nextBtn.setAttribute('class', 'page-item');
        }

        if (getCurrentPage() === 1) {
          prevBtn.classList.add('disabled');
        } else {
          prevBtn.setAttribute('class', 'page-item');
        }
      }
    });

    nextBtn.onclick = () => {
      if (!nextBtn.classList.contains('disabled')) {
        document.querySelector(`#page${getCurrentPage() + 1}`).click();
      }
    }

    prevBtn.onclick = () => {
      if (!prevBtn.classList.contains('disabled')) {
        document.querySelector(`#page${getCurrentPage() - 1}`).click();
      }
    }
  })
}

function loadPage(username, pageN) {
  fetch(`/posts/${username}`)
    .then(response => response.json())
    .then(pages => {
      const pagePosts = pages[pageN];
      document.querySelector('#posts-view').innerHTML = '';
      pagePosts.forEach(post => {
        var currentUsername;
        if (document.querySelector('#username')) {
          currentUsername = document.querySelector('#username').innerHTML;
        }

        var likeBtn = '';
        if (currentUsername !== undefined) {
          if (post.likers.includes(currentUsername)) {
            likeBtn = '<button class="likeBtn btn btn-danger btn-sm">Unlike</button>';
          } else {
            likeBtn = '<button class="likeBtn btn btn-outline-danger btn-sm">Like</button>';
          }
        }

        var editBtn = '';
        if (currentUsername === post.creator) {
          editBtn = '<button class="editBtn btn btn-outline-warning btn-sm">🖉 Edit</button>';
        }

        var isEdited = '';
        if (post.isEdited) {
          isEdited = '(Edited)';
        }

        const cardP = document.createElement('p');
        cardP.innerHTML =
          `<div class="card">
            <div id="${post.id}" class="card-body">
              <p class="font-weight-bold"><a href="${post.creatorProfile}">${post.creator}</a></p>
              <p class="text-muted font-italic" style="font-size: small;">${post.time} ${isEdited}</p>
              <p class="content">${post.content}</p>
              <p>
                <span class="badge badge-pill badge-danger">♥ ${post.likers.length}</span>
                ${likeBtn}
                ${editBtn}
              </p>
            </div>
          </div>`
        document.querySelector('#posts-view').appendChild(cardP);
      });

      document.querySelectorAll('.likeBtn').forEach(likeBtn => {
        likeBtn.onclick = () => {
          console.log('like clicked');
          fetch('/likeUnlike', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'X-CSRFToken': getCookie('csrftoken') },
            body: JSON.stringify({
              action: likeBtn.innerHTML,
              postId: likeBtn.parentElement.parentElement.id
            })
          })
            .then(response => response.json())
            .then(message => {
              console.log(message);
              currentURL = window.location.href;
              if (currentURL.includes('/all/following')) {
                pagination('allFollowing', `page${getCurrentPage()}`);
                loadPage('allFollowing', `page${getCurrentPage()}`);
              } else if (currentURL.includes('/all')) {
                pagination('all', `page${getCurrentPage()}`);
                loadPage('all', `page${getCurrentPage()}`);
              } else if (currentURL.includes('/profile')) {
                profileName = document.querySelector('#profileName').innerHTML;
                pagination(profileName, `page${getCurrentPage()}`);
                loadPage(profileName, `page${getCurrentPage()}`);
              }
            })
        }
      })

      document.querySelectorAll('.editBtn').forEach(editBtn => {
        editBtn.onclick = () => {
          console.log('edit clicked');
          const postId = editBtn.parentElement.parentElement.id;
          const postContent = document.getElementById(`${postId}`).querySelector('.content');
          const form = document.createElement('form');
          form.setAttribute('id', 'editForm');
          form.innerHTML =
            `<div class="form-group">
              <textarea id="edit${postId}" form="editForm" name="editContent" rows="2" class="form-control">${postContent.innerHTML}</textarea>
              <p></p>
              <input type="submit" value="Confirm" class="btn btn-sm btn-warning">
            </div>`
          postContent.parentElement.replaceChild(form, postContent);
          document.getElementById(`${postId}`).querySelector('.editBtn').remove();

          form.onsubmit = (e) => {
            e.preventDefault();
            fetch('/edit', {
              method: 'POST',
              credentials: 'same-origin',
              headers: { 'X-CSRFToken': getCookie('csrftoken') },
              body: JSON.stringify({
                postId: postId,
                editContent: document.querySelector(`#edit${postId}`).value
              })
            })
              .then(response => response.json())
              .then(message => {
                console.log(message);
                currentURL = window.location.href;
                if (currentURL.includes('/all')) {
                  pagination('all', `page${getCurrentPage()}`);
                  loadPage('all', `page${getCurrentPage()}`);
                } else if (currentURL.includes('/profile')) {
                  profileName = document.querySelector('#profileName').innerHTML;
                  pagination(profileName, `page${getCurrentPage()}`);
                  loadPage(profileName, `page${getCurrentPage()}`);
                }
              })
          }
        }
      });

    })
}

function profileView(profileName) {
  fetch('/profileInfo', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'X-CSRFToken': getCookie('csrftoken') },
    body: JSON.stringify({
      profileName: profileName,
    }),
  })
    .then((response) => response.json())
    .then((info) => {
      const followers = info.followers;
      usernameEl = document.querySelector('#username');
      if (usernameEl) {
        username = usernameEl.innerHTML;
        if (username !== profileName) {
          if (followers.includes(username)) {
            followBtn =
              '<button id="followBtn" class="follow btn btn-info btn-sm">Unfollow</button>';
          } else {
            followBtn =
              '<button id="followBtn" class="follow btn btn-outline-info btn-sm">Follow</button>';
          }
          document.querySelector('#follow').innerHTML = followBtn;

          followBtn = document.querySelector('#followBtn');

          followBtn.addEventListener('click', () => {
            fetch('/followUnfollow', {
              method: 'POST',
              credentials: 'same-origin',
              headers: { 'X-CSRFToken': getCookie('csrftoken') },
              body: JSON.stringify({
                action: followBtn.innerHTML,
                profileName: profileName,
              }),
            })
              .then((response) => response.json())
              .then((message) => {
                console.log(message);
                if (followBtn.innerHTML === 'Follow') {
                  document.querySelector('#followerCount').innerHTML = `${
                    followers.length + 1
                  } Followers`;
                } else {
                  document.querySelector('#followerCount').innerHTML = `${
                    followers.length - 1
                  } Followers`;
                }
                profileView(profileName);
              });
          });
        }
      }
    });
}

function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + '=') {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}