FROM ruby:2.3.1

COPY Gemfile Gemfile.lock ./

RUN bundle install

COPY . .

EXPOSE 4567

ENTRYPOINT bundle exec middleman