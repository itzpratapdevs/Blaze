Pod::Spec.new do |s|
  s.name         = "Blaze"
  s.version      = "0.1.0"
  s.summary      = "A lightweight 2D game engine for React Native"
  s.description  = <<-DESC
    Blaze is a high-performance 2D game engine for React Native,
    inspired by Flutter Flame. Build arcade games, endless runners,
    and gamified experiences with clean TypeScript APIs.
  DESC
  s.homepage     = "https://github.com/user/blaze"
  s.license      = { :type => "MIT", :file => "LICENSE" }
  s.authors      = { "Your Name" => "your@email.com" }
  s.platforms    = { :ios => "13.0" }
  s.source       = { :git => "https://github.com/user/blaze.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.swift_version = "5.0"

  s.dependency "React-Core"
  
  # For fabric support
  install_modules_dependencies(s)
end
