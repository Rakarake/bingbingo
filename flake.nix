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
        bingbingoUnwrapped = pkgs.rustPlatform.buildRustPackage {
          pname = "bingbingo";
          version = "0.0.1";
          src = ./.;
          cargoLock = {
            lockFile = ./Cargo.lock;
          };
        };

        # Function with the derivation as return value
        bingbingo = { port, address }: pkgs.stdenv.mkDerivation {
          name = "bingbingo";                                                                          
          src = ./.;
          buildInputs = [ pkgs.makeWrapper ];
          installPhase = ''
            mkdir -p $out/bin
            cp ${bingbingoUnwrapped}/bin/bingbingo $out/bin/
            # Create a wrapper script to set environment variables
            wrapProgram $out/bin/bingbingo \
              --set SERVE_DIR ${self}/public \
              --set RUST_LOG trace \
              --set PORT ${port} \
              --set ADDRESS ${address}
          '';
        };
        defaultPackage = bingbingo { port = "80"; address = "localhost"; };
        
        # Big host
        nixosModules.default = { lib, config, ... }:
        with lib;
        let
          cfg = config.services.bingbingo;
        in
        {
          options.services.bingbingo = {
            enable = mkEnableOption "The bing bingo";
            port = mkOption {
              type = types.port;
              default = 80;
            };
            address = mkOption {
              type = types.str;
              default = "localhost";
            };
          };
          config = mkIf cfg.enable {
            systemd.services.bingbingo = {
              description = "bingbingo";
              wantedBy = [ "multi-user.target" ]; 
              after = [ "network.target" ];
              serviceConfig = {
                User = "bingbingo";
                ExecStart = "${bingbingo {port=cfg.port; address=cfg.address;}}/bin/bingbingo";
              };
            };
            users.users.bingbingo = {
              description = "Bingbingo Service";
              isSystemUser = true;
              group = "bingbingo";
            };
            users.groups.bingbingo = {};
          };
        };

        devShell = pkgs.mkShell {
          packages = [ rust pkgs.curl ];
        };
      }
    );
}

