{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    hex.url = "github:jpetrucciani/hex";
    hex.inputs.nixpkgs.follows = "nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { flake-utils, nixpkgs, hex, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        _hex = hex.packages.${system};
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            corepack_22
            # nodejs_22
            bun
            nodePackages.typescript
            nodePackages.typescript-language-server
            hcloud
            opentofu
            kubectl
            _hex.hex
          ];
        };
      });
}
