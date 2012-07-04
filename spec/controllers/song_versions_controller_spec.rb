require 'spec_helper'

describe SongVersionsController do

  describe "GET 'add_track'" do
    it "returns http success" do
      get 'add_track'
      response.should be_success
    end
  end

  describe "POST 'projects'" do
    it "returns http succes" do
      post "projects", :title => "test", :bpm => "120"
      response.should be_success
    end
  end

end
