{pkgs}: {
  deps = [
    pkgs.alsa-lib
    pkgs.libxkbcommon
    pkgs.expat
    pkgs.libdrm
    pkgs.cups
    pkgs.atk
    pkgs.dbus
    pkgs.nspr
    pkgs.nss
    pkgs.glib
    pkgs.xorg.libxcb
    pkgs.xorg.libXtst
    pkgs.xorg.libXrender
    pkgs.xorg.libXi
    pkgs.xorg.libXfixes
    pkgs.xorg.libXext
    pkgs.xorg.libXdamage
    pkgs.xorg.libXcursor
    pkgs.xorg.libX11
    pkgs.chromium
  ];
}
