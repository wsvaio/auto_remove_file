const PATH = Deno.args[0];

const watcher = Deno.watchFs(PATH, { recursive: true });

const handler = async () => {
  const fileMap = new Map<string, Deno.FileInfo>();
  const dirMap = new Map<string, Deno.FileInfo>();
  let latestTime = new Date(0);

  const init = async (path: string) => {
    const r = await Deno.stat(path);

    if (r.isDirectory) {
      dirMap.set(path, r);
      const dirs = Deno.readDir(path);
      for await (const dir of dirs) {
        await init(`${path}/${dir.name}`);
      }
    } else {
      if (r.mtime && r.mtime > latestTime) latestTime = r.mtime;
      fileMap.set(path, r);
    }
  };
  await init(PATH);

  for (const [path, info] of fileMap) {
    if (
      info.mtime &&
      info.mtime.getTime() < (latestTime.getTime() - 60000)
    ) {
      await Deno.remove(path);
      console.log(`del: ${path}`);
    }
  }

  loop1:
  for (const [path] of dirMap) {
    if (path == PATH) continue;
    for await (const _ of Deno.readDir(path)) {
      continue loop1;
    }
    await Deno.remove(path);
    console.log(`del: ${path}`);
  }
};

// console.log(map, latestTime);

let timer;
for await (const _ of watcher) {
  clearTimeout(timer);
  timer = setTimeout(() => {
    handler();
  }, 10000);
}
