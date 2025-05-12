package com.mealmanager.api.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.config.AbstractRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.listener.AbstractMessageListenerContainer;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;

/**
 * ApplicationContextInitializer to disable RabbitMQ listeners during tests.
 * This prevents RabbitMQ listeners from starting up and attempting to connect to 
 * email services, which causes authentication errors during tests.
 */
public class DisableRabbitListenersInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {
    
    private static final Logger log = LoggerFactory.getLogger(DisableRabbitListenersInitializer.class);
    
    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        log.info("Initializing test context with disabled RabbitMQ listeners");
        
        // Add a BeanPostProcessor that will disable auto-startup for any RabbitMQ listener containers
        applicationContext.getBeanFactory().addBeanPostProcessor(new BeanPostProcessor() {
            @Override
            public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
                // Disable listener container factories
                if (bean instanceof AbstractRabbitListenerContainerFactory) {
                    log.info("Disabling auto-startup for RabbitMQ listener container factory: {}", beanName);
                    ((AbstractRabbitListenerContainerFactory<?>) bean).setAutoStartup(false);
                }
                
                // Disable already created listener containers
                if (bean instanceof AbstractMessageListenerContainer) {
                    log.info("Disabling auto-startup for RabbitMQ message listener container: {}", beanName);
                    ((AbstractMessageListenerContainer) bean).setAutoStartup(false);
                }
                
                return bean;
            }
        });
    }
} 