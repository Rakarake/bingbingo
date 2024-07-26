{
  description = "Bingbingo 🗿, to bingo";
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
        rust = pkgs.rust-bin.stable.latest.default;
      in rec {
        # The rust package, use `nix build` to build
        bingbingoUnwrapped = pkgs.rustPlatform.buildRustPackage {
          pname = "bingbingo";
          version = "0.0.1";
          src = ./.;
          cargoLock = {
            lockFile = ./Cargo.lock;
          };
        };
        defaultPackage = pkgs.stdenv.mkDerivation {
          name = "bingbingo";                                                                          
          src = ./.;
          buildInputs = [ pkgs.makeWrapper ];
          installPhase = ''
            mkdir -p $out/bin
            cp ${bingbingoUnwrapped}/bin/bingbingo $out/bin/
            # Create a wrapper script to set environment variables
            wrapProgram $out/bin/bingbingo \
              --set SERVE_DIR ${self}/public \
              --set RUST_LOG trace
          '';
        };

        devShell = pkgs.mkShell {
          packages = [ rust pkgs.curl ];
        };
      }
    );
}

