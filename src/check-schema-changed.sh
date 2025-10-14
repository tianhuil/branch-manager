#!/usr/bin/expect -f

spawn bash -c "bun drizzle-kit push --verbose --strict"

# Wait for any prompt (or timeout)
expect {
    -re ".*" {
        puts "changes necessary"
        exit 1
    }
    eof {
        puts "skipping"
        exit 0
    }
}