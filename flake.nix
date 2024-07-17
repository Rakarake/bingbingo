{
  description = "bing bing";
  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "nixpkgs/nixos-unstable";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  outputs = { self, nixpkgs, rust-overlay, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlays = [ rust-overlay.overlays.default ];
        pkgs = import nixpkgs { inherit overlays system; };
        # This makes all targets available, WASM
        rust = pkgs.rust-bin.stable.latest.default;
      in {
        # The rust package, use `nix build` to build
        defaultPackage = pkgs.rustPlatform.buildRustPackage {
          pname = "bingbingo";
          version = "0.0.1";
          src = ./.;
          cargoLock = {
            lockFile = ./Cargo.lock;
          };
        };

        # This makes sure we can build for WASM
        # Remember to add necessary changes made in defaultPackage to devShell
        devShell = pkgs.mkShell {
          packages = [ rust ];
        };
      }
    );
}
