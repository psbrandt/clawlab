RSpec::Matchers.define :be_the_same_as do |expected|
  match do |actual|
    actual.same_as? expected
  end
end