package jcash.config;

import jcash.service.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Bean
    public UserRepository userRepository() throws BankingException {
        return new JdbcUserRepository();
    }

    @Bean
    public AuthService authService(UserRepository repo) {
        return new AuthService(repo);
    }

    @Bean
    public BankingService bankingService(UserRepository repo) {
        return new BankingService(repo);
    }
}
