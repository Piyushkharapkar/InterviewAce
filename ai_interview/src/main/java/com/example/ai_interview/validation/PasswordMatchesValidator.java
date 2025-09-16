package com.example.ai_interview.validation;

import com.example.ai_interview.dto.AuthDTO;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordMatchesValidator implements ConstraintValidator<PasswordMatches, AuthDTO.RegisterRequest> {
    @Override
    public boolean isValid(final AuthDTO.RegisterRequest request, final ConstraintValidatorContext context) {
        if (request.getPassword() == null || request.getConfirmPassword() == null) {
            return false;
        }
        return request.getPassword().equals(request.getConfirmPassword());
    }
}
