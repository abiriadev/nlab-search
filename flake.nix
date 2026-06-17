{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = (
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      with pkgs;
      {
        devShells.default = mkShell {
          # The default `nodejs` in nixpkgs lags badly (often v14); pin a recent major.
          packages = [
            nodejs
            pnpm
            cloudflared
            wrangler
          ];
        };
      }
    )
  );
}
