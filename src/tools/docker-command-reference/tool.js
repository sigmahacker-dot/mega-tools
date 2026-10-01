/* Docker Command Reference — 50+ commands, searchable, click-to-copy. */
(function () {
  'use strict';
  var SLUG = 'docker-command-reference';
  var GROUPS = [
    ['Containers', [
      ['docker run hello-world', 'Verify Docker works'],
      ['docker run -d --name web -p 8080:80 nginx', 'Run nginx detached on port 8080'],
      ['docker run -it ubuntu bash', 'Interactive shell in Ubuntu'],
      ['docker run -e KEY=val image', 'Set an environment variable'],
      ['docker run -v data:/data image', 'Mount a volume'],
      ['docker ps', 'List running containers'],
      ['docker ps -a', 'List all containers'],
      ['docker stop web', 'Stop a container'],
      ['docker start web', 'Start a stopped container'],
      ['docker restart web', 'Restart a container'],
      ['docker rm web', 'Remove a container'],
      ['docker rm -f web', 'Force-remove a running container'],
      ['docker exec -it web bash', 'Shell into a running container'],
      ['docker logs web', 'Show container logs'],
      ['docker logs -f web', 'Follow container logs'],
      ['docker inspect web', 'Full container details as JSON'],
      ['docker stats', 'Live resource usage'],
      ['docker cp web:/app/out ./', 'Copy files out of a container'],
      ['docker rename old new', 'Rename a container']
    ]],
    ['Images', [
      ['docker images', 'List local images'],
      ['docker pull node:20', 'Download an image'],
      ['docker build -t myapp .', 'Build from a Dockerfile'],
      ['docker build --no-cache -t myapp .', 'Build ignoring the cache'],
      ['docker tag myapp repo/myapp:1.0', 'Tag an image'],
      ['docker push repo/myapp:1.0', 'Push to a registry'],
      ['docker rmi node:20', 'Remove an image'],
      ['docker image prune', 'Remove unused images'],
      ['docker history myapp', 'Show image layer history'],
      ['docker save myapp -o myapp.tar', 'Export an image to a tarball'],
      ['docker load -i myapp.tar', 'Import an image from a tarball']
    ]],
    ['Volumes', [
      ['docker volume ls', 'List volumes'],
      ['docker volume create data', 'Create a volume'],
      ['docker volume inspect data', 'Volume details'],
      ['docker volume rm data', 'Remove a volume'],
      ['docker volume prune', 'Remove unused volumes']
    ]],
    ['Networks', [
      ['docker network ls', 'List networks'],
      ['docker network create mynet', 'Create a network'],
      ['docker network inspect mynet', 'Network details'],
      ['docker network connect mynet web', 'Attach a container'],
      ['docker network rm mynet', 'Remove a network']
    ]],
    ['Dockerfile', [
      ['FROM node:20-alpine', 'Base image'],
      ['WORKDIR /app', 'Working directory'],
      ['COPY package*.json ./', 'Copy dependency manifests'],
      ['RUN npm ci --omit=dev', 'Install production deps'],
      ['COPY . .', 'Copy the app'],
      ['EXPOSE 3000', 'Document the port'],
      ['ENV NODE_ENV=production', 'Set an env var'],
      ['CMD ["node", "index.js"]', 'Default command']
    ]],
    ['Docker Compose', [
      ['docker compose up', 'Start services (foreground)'],
      ['docker compose up -d', 'Start services detached'],
      ['docker compose up --build', 'Rebuild then start'],
      ['docker compose down', 'Stop and remove services'],
      ['docker compose down -v', 'Also remove volumes'],
      ['docker compose ps', 'List compose containers'],
      ['docker compose logs -f', 'Follow service logs'],
      ['docker compose exec web bash', 'Shell into a service'],
      ['docker compose pull', 'Pull service images'],
      ['docker compose config', 'Validate and print config'],
      ['docker compose restart web', 'Restart one service']
    ]],
    ['Cleanup', [
      ['docker system df', 'Docker disk usage'],
      ['docker system prune', 'Remove unused data'],
      ['docker system prune -a', 'Also remove unused images'],
      ['docker container prune', 'Remove stopped containers']
    ]]
  ];

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }

  function render(filter) {
    var host = el(SLUG + '-list');
    host.innerHTML = '';
    var q = (filter || '').toLowerCase().trim();
    var shown = 0;
    GROUPS.forEach(function (g) {
      var items = g[1].filter(function (it) {
        return !q || it[0].toLowerCase().indexOf(q) >= 0 || it[1].toLowerCase().indexOf(q) >= 0;
      });
      if (!items.length) return;
      shown += items.length;
      var h = document.createElement('h3');
      h.textContent = g[0];
      h.style.margin = '18px 0 8px';
      host.appendChild(h);
      items.forEach(function (it) {
        var row = document.createElement('div');
        row.className = 'copy-row';
        row.style.cssText = 'margin-bottom:8px;cursor:pointer';
        row.title = 'Click to copy';
        var code = document.createElement('code');
        code.className = 'code';
        code.style.flex = '1';
        code.textContent = it[0];
        var desc = document.createElement('span');
        desc.className = 'muted';
        desc.style.cssText = 'flex:1.4;font-size:13px';
        desc.textContent = it[1];
        row.appendChild(code);
        row.appendChild(desc);
        row.addEventListener('click', function () {
          TN.copy(it[0]).then(function (ok) {
            if (!ok) fail('Copy failed — select the text manually.');
          });
        });
        host.appendChild(row);
      });
    });
    el(SLUG + '-none').classList.toggle('hidden', shown > 0);
  }

  try {
    TN.on(SLUG + '-search', 'input', TN.debounce(function () {
      render(el(SLUG + '-search').value);
    }, 150));
    render('');
  } catch (e) { /* never throw on load */ }
})();
