const systemInfo = {
  SistemaOperativo: process.platform,
  VersionNode: process.version,
  MemoriaTotalReservada: process.memoryUsage.rss,
  PathDeEjecucion: process.execPath,
  ProcessId: process.pid,
  CarpetaDelProyecto: process.cwd,
};

module.exports = {
  systemInfo,
};
